/**
 * pages/recipe.js — Scheda ricetta (recipe.html?id=…).
 * Mostra ingredienti, procedimento, note private (solo per l'utente loggato
 * che ha la ricetta nel ricettario) e recensioni pubbliche.
 */

const Page = {
    render(params) {
        const id = params.get('id');
        const recipe = DB.getRecipe(id);
        if (!recipe) {
            return `<section><h1>Ricetta non trovata</h1>
                <p class="empty-msg">La ricetta richiesta non è presente nel Web Storage.</p>
                <a class="btn" href="search.html?type=all">Torna alla ricerca</a></section>`;
        }
        const user = DB.currentUser();
        const entry = user ? user.cookbook.find(e => e.recipeId === id) : null;
        const reviews = DB.getReviewsForRecipe(id);
        const avg = key => reviews.length
            ? (reviews.reduce((s, r) => s + Number(r[key]), 0) / reviews.length).toFixed(1)
            : null;

        return `
        <article class="recipe-detail">
            <div class="recipe-head">
                <img class="recipe-img" src="${esc(recipe.thumb)}" alt="${esc(recipe.name)}">
                <div class="recipe-head-info">
                    <h1>${esc(recipe.name)}</h1>
                    <p class="card-meta">${esc(recipe.category)}${recipe.area ? ' · Cucina ' + esc(recipe.area) : ''}</p>
                    ${recipe.tags.length ? `<p class="tags">${recipe.tags.map(t => `<span class="tag">${esc(t)}</span>`).join('')}</p>` : ''}
                    ${reviews.length ? `
                        <p class="avg-ratings">
                            <span title="Gusto medio">Gusto ${stars(Math.round(avg('taste')))} ${avg('taste')}/5</span><br>
                            <span title="Difficoltà media">Difficoltà ${stars(Math.round(avg('difficulty')))} ${avg('difficulty')}/5</span>
                        </p>` : ''}
                    ${user ? `
                        <button type="button" class="btn ${entry ? '' : 'btn-primary'}"
                                data-action="${entry ? 'remove-from-cookbook' : 'add-to-cookbook'}"
                                data-recipe="${esc(id)}">
                            ${entry ? '✓ Nel ricettario — rimuovi' : '+ Aggiungi al ricettario'}
                        </button>`
                        : `<p class="muted"><a href="login.html">Accedi</a> per salvare la ricetta nel tuo ricettario.</p>`}
                    ${recipe.youtube ? `<p><a class="link" href="${esc(recipe.youtube)}" target="_blank" rel="noopener">▶ Video ricetta su YouTube</a></p>` : ''}
                </div>
            </div>

            <div class="recipe-columns">
                <section class="panel">
                    <h2>Ingredienti</h2>
                    <ul class="ingredient-list">
                        ${recipe.ingredients.map(ing =>
                            `<li><span>${esc(ing.name)}</span><span class="muted">${esc(ing.measure)}</span></li>`).join('')}
                    </ul>
                </section>
                <section class="panel">
                    <h2>Procedimento</h2>
                    <div class="instructions">${esc(recipe.instructions).replace(/\r?\n+/g, '</p><p>').replace(/^/, '<p>') + '</p>'}</div>
                </section>
            </div>

            ${renderNotesSection(user, entry, id)}
            ${renderReviewsSection(user, reviews, id)}
        </article>`;
    },
    bind(params) {
        const id = params.get('id');
        const noteForm = document.getElementById('note-form');
        if (noteForm) {
            noteForm.addEventListener('submit', event => {
                event.preventDefault();
                const text = noteForm.elements.text.value.trim();
                if (!text) return;
                const user = DB.currentUser();
                const entry = user.cookbook.find(e => e.recipeId === id);
                entry.notes.push({ id: uid(), text, createdAt: Date.now() });
                DB.updateUser(user);
                toast('Nota privata salvata.', 'success');
                render();
            });
        }
        const reviewForm = document.getElementById('review-form');
        if (reviewForm) {
            reviewForm.addEventListener('submit', event => {
                event.preventDefault();
                const user = DB.currentUser();
                const data = new FormData(reviewForm);
                DB.addReview({
                    id: uid(),
                    recipeId: id,
                    userId: user.id,
                    username: user.username,
                    prepDate: data.get('prepDate'),
                    difficulty: Number(data.get('difficulty')),
                    taste: Number(data.get('taste')),
                    comment: String(data.get('comment') || '').trim(),
                    createdAt: Date.now()
                });
                toast('Recensione pubblicata!', 'success');
                render();
            });
        }
    }
};

function renderNotesSection(user, entry, recipeId) {
    if (!user) return '';
    if (!entry) {
        return `<section class="panel">
            <h2>Note personali</h2>
            <p class="muted">Aggiungi la ricetta al tuo ricettario per inserire note private.</p>
        </section>`;
    }
    return `
    <section class="panel">
        <h2>Note personali <span class="muted small">(visibili solo a te)</span></h2>
        ${entry.notes.length === 0 ? '<p class="muted">Nessuna nota per questa ricetta.</p>' : `
        <ul class="note-list">
            ${entry.notes.map(note => `
                <li>
                    <div>
                        <p>${esc(note.text)}</p>
                        <span class="muted small">${fmtDate(note.createdAt)}</span>
                    </div>
                    <button type="button" class="btn btn-small btn-danger" data-action="delete-note"
                            data-recipe="${esc(recipeId)}" data-note="${esc(note.id)}">Elimina</button>
                </li>`).join('')}
        </ul>`}
        <form id="note-form" class="inline-form d-flex flex-wrap">
            <textarea name="text" class="form-control" rows="2" placeholder="Scrivi una nota privata (es. varianti, dosi, consigli)…" required></textarea>
            <button type="submit" class="btn btn-primary">Aggiungi nota</button>
        </form>
    </section>`;
}

function renderReviewsSection(user, reviews, recipeId) {
    return `
    <section class="panel">
        <h2>Recensioni <span class="muted small">(${reviews.length})</span></h2>
        ${reviews.length === 0 ? '<p class="muted">Ancora nessuna recensione: sii il primo a lasciarne una!</p>' : `
        <ul class="review-list">
            ${reviews.map(review => `
                <li class="review">
                    <div class="review-head">
                        <strong>${esc(review.username)}</strong>
                        <span class="muted small">ha preparato il piatto il ${fmtDate(review.prepDate)}</span>
                        ${user && user.id === review.userId
                            ? `<button type="button" class="btn btn-small btn-danger" data-action="remove-review"
                                       data-review="${esc(review.id)}">Rimuovi</button>` : ''}
                    </div>
                    <p class="review-ratings">
                        <span>Gusto: <span class="stars">${stars(review.taste)}</span></span>
                        <span>Difficoltà: <span class="stars">${stars(review.difficulty)}</span></span>
                    </p>
                    ${review.comment ? `<p>${esc(review.comment)}</p>` : ''}
                </li>`).join('')}
        </ul>`}
        ${user ? `
        <form id="review-form" class="review-form">
            <h3>Lascia una recensione</h3>
            <div class="form-row">
                <label class="form-label">Data di preparazione
                    <input type="date" name="prepDate" class="form-control" max="${todayISO()}" required>
                </label>
                <label class="form-label">Voto difficoltà
                    <select name="difficulty" class="form-select" required>
                        ${[1, 2, 3, 4, 5].map(n => `<option value="${n}" ${n === 3 ? 'selected' : ''}>${n} — ${stars(n)}</option>`).join('')}
                    </select>
                </label>
                <label class="form-label">Voto gusto
                    <select name="taste" class="form-select" required>
                        ${[1, 2, 3, 4, 5].map(n => `<option value="${n}" ${n === 4 ? 'selected' : ''}>${n} — ${stars(n)}</option>`).join('')}
                    </select>
                </label>
            </div>
            <textarea name="comment" class="form-control" rows="2" placeholder="Commento (facoltativo)…"></textarea>
            <button type="submit" class="btn btn-primary">Pubblica recensione</button>
        </form>`
        : `<p class="muted"><a href="login.html">Accedi</a> per lasciare una recensione.</p>`}
    </section>`;
}
