/**
 * pages/cookbook.js — Ricettario personale (cookbook.html, richiede login).
 * Elenca le ricette salvate con possibilità di personalizzarle (titolo e
 * procedimento propri), aprirle o rimuoverle. Permette inoltre di creare
 * ricette proprie, salvate nell'archivio condiviso del Web Storage.
 */

/** Immagine segnaposto per le ricette create senza URL immagine. */
const CUSTOM_RECIPE_THUMB = 'data:image/svg+xml,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">' +
    '<rect width="400" height="300" fill="#fdf0e7"/>' +
    '<text x="200" y="185" font-size="120" text-anchor="middle">🍲</text></svg>');

const Page = {
    requiresAuth: true,
    render() {
        const user = DB.currentUser();
        const entries = user.cookbook
            .map(entry => ({ entry, recipe: DB.getRecipe(entry.recipeId) }))
            .filter(x => x.recipe);

        return `
        <section>
            <h1>Il mio ricettario</h1>
            <p class="muted">${entries.length === 0
                ? 'Il tuo ricettario è vuoto: cerca una ricetta e aggiungila, oppure creane una tua!'
                : `${entries.length} ricett${entries.length === 1 ? 'a salvata' : 'e salvate'}. Puoi personalizzarle, annotarle o rimuoverle.`}</p>
            <div class="entry-actions d-flex flex-wrap">
                ${entries.length === 0 ? `<a class="btn" href="search.html?type=all">Sfoglia le ricette</a>` : ''}
                <button type="button" class="btn btn-primary" data-action="toggle-create">+ Crea una tua ricetta</button>
            </div>
            ${renderCreateForm()}
            <div class="cookbook-list">
                ${entries.map(({ entry, recipe }) => renderCookbookEntry(entry, recipe, user.id)).join('')}
            </div>
        </section>`;
    },
    bind() {
        const createForm = document.getElementById('create-recipe-form');
        document.querySelectorAll('[data-action="toggle-create"]').forEach(btn =>
            btn.addEventListener('click', () => {
                createForm.hidden = !createForm.hidden;
                if (!createForm.hidden) createForm.elements.name.focus();
            }));
        createForm.addEventListener('submit', event => {
            event.preventDefault();
            const user = DB.currentUser();
            const data = new FormData(createForm);
            const name = String(data.get('name') || '').trim();
            const instructions = String(data.get('instructions') || '').trim();
            const ingredients = parseIngredients(data.get('ingredients'));
            if (!name || !instructions) {
                toast('Nome e procedimento sono obbligatori.', 'error');
                return;
            }
            if (ingredients.length === 0) {
                toast('Inserisci almeno un ingrediente (uno per riga).', 'error');
                return;
            }
            const recipe = {
                id: 'custom-' + uid(),
                name,
                category: String(data.get('category') || '').trim(),
                area: String(data.get('area') || '').trim(),
                instructions,
                thumb: String(data.get('thumb') || '').trim() || CUSTOM_RECIPE_THUMB,
                tags: [],
                youtube: '',
                ingredients,
                custom: true,
                ownerId: user.id
            };
            DB.upsertRecipes([recipe]);
            user.cookbook.push({ recipeId: recipe.id, addedAt: Date.now(), custom: null, notes: [] });
            DB.updateUser(user);
            toast(`«${recipe.name}» creata e aggiunta al ricettario!`, 'success');
            render();
        });

        document.querySelectorAll('form.entry-edit-form').forEach(form => {
            form.addEventListener('submit', event => {
                event.preventDefault();
                const user = DB.currentUser();
                const entry = user.cookbook.find(e => e.recipeId === form.dataset.recipe);
                if (!entry) return;
                const name = form.elements.customName.value.trim();
                const instructions = form.elements.customInstructions.value.trim();
                entry.custom = (name || instructions) ? { name, instructions } : null;
                DB.updateUser(user);
                toast('Modifiche al ricettario salvate.', 'success');
                render();
            });
        });
    }
};

/** Converte il testo "un ingrediente per riga, dose dopo i due punti" nel modello interno. */
function parseIngredients(raw) {
    return String(raw || '')
        .split('\n')
        .map(line => line.trim())
        .filter(Boolean)
        .map(line => {
            const [name, ...measure] = line.split(':');
            return { name: name.trim(), measure: measure.join(':').trim() };
        })
        .filter(ing => ing.name);
}

function renderCreateForm() {
    return `
    <form id="create-recipe-form" class="panel form-stack" hidden>
        <h2>Nuova ricetta personale</h2>
        <p class="muted small">La ricetta viene salvata nell'archivio del Web Storage insieme a quelle
           di TheMealDB: comparirà nelle ricerche di tutti gli utenti, ma solo tu potrai eliminarla.</p>
        <label class="form-label">Nome del piatto
            <input type="text" name="name" class="form-control" required maxlength="80">
        </label>
        <div class="form-row">
            <label class="form-label">Categoria <span class="muted small">(facoltativa)</span>
                <input type="text" name="category" class="form-control" placeholder="es. Primo, Dessert">
            </label>
            <label class="form-label">Cucina <span class="muted small">(facoltativa)</span>
                <input type="text" name="area" class="form-control" placeholder="es. Italiana">
            </label>
        </div>
        <label class="form-label">Ingredienti <span class="muted small">(uno per riga, dose dopo i due punti)</span>
            <textarea name="ingredients" class="form-control" rows="4" required
                      placeholder="Spaghetti: 320 g&#10;Guanciale: 150 g&#10;Pecorino romano: 50 g"></textarea>
        </label>
        <label class="form-label">Procedimento
            <textarea name="instructions" class="form-control" rows="5" required
                      placeholder="Descrivi la preparazione passo per passo…"></textarea>
        </label>
        <label class="form-label">URL dell'immagine del piatto <span class="muted small">(facoltativo)</span>
            <input type="url" name="thumb" class="form-control" placeholder="https://…">
        </label>
        <div class="entry-actions d-flex flex-wrap">
            <button type="submit" class="btn btn-primary">Crea e aggiungi al ricettario</button>
            <button type="button" class="btn" data-action="toggle-create">Annulla</button>
        </div>
    </form>`;
}

function renderCookbookEntry(entry, recipe, userId) {
    const displayName = entry.custom && entry.custom.name ? entry.custom.name : recipe.name;
    const isCustom = Boolean(entry.custom && (entry.custom.name || entry.custom.instructions));
    return `
    <article class="cookbook-entry panel">
        <div class="entry-main">
            <a href="recipe.html?id=${encodeURIComponent(recipe.id)}">
                <img class="entry-img" src="${esc(recipe.thumb)}" alt="${esc(recipe.name)}" loading="lazy">
            </a>
            <div class="entry-info">
                <h2><a class="link-plain" href="recipe.html?id=${encodeURIComponent(recipe.id)}">${esc(displayName)}</a>
                    ${recipe.custom ? `<span class="tag tag-chef">${recipe.ownerId === userId ? 'creata da te' : 'ricetta di un utente'}</span>` : ''}
                    ${isCustom ? '<span class="tag">personalizzata</span>' : ''}</h2>
                <p class="card-meta">${recipe.category ? esc(recipe.category) + ' · ' : ''}${recipe.area ? esc(recipe.area) + ' · ' : ''}aggiunta il ${fmtDate(entry.addedAt)}</p>
                ${entry.custom && entry.custom.instructions
                    ? `<p class="entry-custom-note"><strong>Procedimento personalizzato:</strong> ${esc(entry.custom.instructions)}</p>` : ''}
                ${entry.notes.length
                    ? `<p class="muted small">📝 ${entry.notes.length} not${entry.notes.length === 1 ? 'a privata' : 'e private'}</p>` : ''}
                <div class="entry-actions d-flex flex-wrap">
                    <a class="btn btn-small" href="recipe.html?id=${encodeURIComponent(recipe.id)}">Apri scheda</a>
                    <button type="button" class="btn btn-small" data-action="toggle-edit" data-recipe="${esc(recipe.id)}">Modifica</button>
                    <button type="button" class="btn btn-small btn-danger" data-action="remove-from-cookbook"
                            data-recipe="${esc(recipe.id)}">Rimuovi</button>
                </div>
            </div>
        </div>
        <form class="entry-edit-form" data-recipe="${esc(recipe.id)}" hidden>
            <label class="form-label">Titolo personalizzato
                <input type="text" name="customName" class="form-control" value="${esc(entry.custom ? entry.custom.name : '')}"
                       placeholder="${esc(recipe.name)}">
            </label>
            <label class="form-label">Procedimento personalizzato
                <textarea name="customInstructions" class="form-control" rows="3"
                          placeholder="Le tue varianti al procedimento originale…">${esc(entry.custom ? entry.custom.instructions : '')}</textarea>
            </label>
            <div class="entry-actions d-flex flex-wrap">
                <button type="submit" class="btn btn-primary btn-small">Salva modifiche</button>
                <button type="button" class="btn btn-small" data-action="reset-custom" data-recipe="${esc(recipe.id)}">
                    Ripristina originale</button>
            </div>
        </form>
    </article>`;
}
