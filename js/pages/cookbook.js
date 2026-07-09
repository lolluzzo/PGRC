/**
 * pages/cookbook.js — Ricettario personale (cookbook.html, richiede login).
 * Elenca le ricette salvate con possibilità di personalizzarle (titolo e
 * procedimento propri), aprirle o rimuoverle.
 */

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
                ? 'Il tuo ricettario è vuoto: cerca una ricetta e aggiungila!'
                : `${entries.length} ricett${entries.length === 1 ? 'a salvata' : 'e salvate'}. Puoi personalizzarle, annotarle o rimuoverle.`}</p>
            ${entries.length === 0 ? `<a class="btn btn-primary" href="search.html?type=all">Sfoglia le ricette</a>` : ''}
            <div class="cookbook-list">
                ${entries.map(({ entry, recipe }) => renderCookbookEntry(entry, recipe)).join('')}
            </div>
        </section>`;
    },
    bind() {
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

function renderCookbookEntry(entry, recipe) {
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
                    ${isCustom ? '<span class="tag">personalizzata</span>' : ''}</h2>
                <p class="card-meta">${esc(recipe.category)}${recipe.area ? ' · ' + esc(recipe.area) : ''}
                    · aggiunta il ${fmtDate(entry.addedAt)}</p>
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
