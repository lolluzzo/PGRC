/**
 * ui.js — Livello di interfaccia condiviso da tutte le pagine.
 *
 * Contiene: utility generiche, componenti HTML riusabili (card, griglia,
 * barra lettere, form di ricerca), aggiornamento della barra di navigazione,
 * il ciclo di rendering della pagina corrente e le azioni globali gestite
 * con event delegation.
 *
 * Ogni pagina HTML definisce nel proprio script (js/pages/*.js) un oggetto
 * globale `Page` con:
 *   - render(params) : ritorna l'HTML della vista (params = URLSearchParams)
 *   - bind(params)   : (facoltativo) aggancia gli eventi dopo il render
 *   - requiresAuth   : (facoltativo) true se la pagina richiede il login
 */

const PAGE_SIZE = 24;

const App = {
    state: {
        shown: PAGE_SIZE,     // quante card mostrare (paginazione "Mostra altri")
        resetEmail: null,     // email in corso di recupero password
        resetQuestion: null   // domanda di sicurezza mostrata nel recupero
    }
};

/* =========================================================
 *  Utility
 * ========================================================= */

function esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
}

function toast(message, type = 'info') {
    const el = document.getElementById('toast');
    el.textContent = message;
    el.className = `toast toast-${type} toast-visible`;
    el.hidden = false;
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
        el.classList.remove('toast-visible');
        el.hidden = true;
    }, 3500);
}

/**
 * Memorizza un messaggio da mostrare come toast DOPO il prossimo cambio di
 * pagina (essendo l'app multi-pagina, un toast mostrato subito prima di una
 * navigazione andrebbe perso con il ricaricamento).
 */
function flash(message, type = 'info') {
    sessionStorage.setItem('pgrc_flash', JSON.stringify({ message, type }));
}

function showFlash() {
    const raw = sessionStorage.getItem('pgrc_flash');
    if (!raw) return;
    sessionStorage.removeItem('pgrc_flash');
    try {
        const { message, type } = JSON.parse(raw);
        toast(message, type);
    } catch { /* messaggio malformato: lo si ignora */ }
}

function stars(n) {
    n = Math.max(1, Math.min(5, Number(n) || 0));
    return '★'.repeat(n) + '☆'.repeat(5 - n);
}

function fmtDate(value) {
    const date = typeof value === 'number' ? new Date(value) : new Date(String(value));
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });
}

function todayISO() {
    return new Date().toISOString().slice(0, 10);
}

function navigate(url) {
    location.href = url;
}

/* =========================================================
 *  Componenti riusabili
 * ========================================================= */

function recipeCard(recipe) {
    return `
    <a class="card" href="recipe.html?id=${encodeURIComponent(recipe.id)}">
        <img class="card-img" src="${esc(recipe.thumb)}" alt="${esc(recipe.name)}" loading="lazy">
        <div class="card-body">
            <h3 class="card-title">${esc(recipe.name)}</h3>
            <p class="card-meta">${esc(recipe.category)}${recipe.area ? ' · ' + esc(recipe.area) : ''}
                ${recipe.custom ? '<span class="tag tag-chef">ricetta utente</span>' : ''}</p>
        </div>
    </a>`;
}

function recipeGrid(recipes, { paginate = false } = {}) {
    if (recipes.length === 0) {
        return `<p class="empty-msg">Nessuna ricetta trovata.</p>`;
    }
    const visible = paginate ? recipes.slice(0, App.state.shown) : recipes;
    const moreBtn = paginate && recipes.length > App.state.shown
        ? `<div class="center text-center"><button type="button" class="btn" data-action="load-more">
               Mostra altri (${recipes.length - App.state.shown} rimanenti)</button></div>`
        : '';
    return `<div class="grid">${visible.map(recipeCard).join('')}</div>${moreBtn}`;
}

function letterBar(active = '') {
    const letters = 'abcdefghijklmnopqrstuvwxyz'.split('');
    return `<nav class="letter-bar d-flex flex-wrap" aria-label="Filtra per lettera iniziale">
        ${letters.map(l =>
            `<a class="letter ${l === active ? 'letter-active' : ''}"
                href="search.html?type=letter&q=${l}">${l.toUpperCase()}</a>`).join('')}
    </nav>`;
}

function searchForm(type = 'name', query = '') {
    const options = [
        ['name', 'Titolo del piatto'],
        ['ingredient', 'Ingrediente'],
        ['text', 'Testo descrittivo'],
        ['all', 'Tutti i campi']
    ];
    return `
    <form id="search-form" class="search-form d-flex flex-wrap justify-content-center" role="search" action="search.html">
        <select name="type" class="form-select" aria-label="Tipo di ricerca">
            ${options.map(([value, label]) =>
                `<option value="${value}" ${value === type ? 'selected' : ''}>${label}</option>`).join('')}
        </select>
        <input type="search" name="q" class="form-control" value="${esc(query)}" placeholder="Cerca una ricetta…"
               aria-label="Termine di ricerca" ${type === 'all' ? '' : 'required'}>
        <button type="submit" class="btn btn-primary">Cerca</button>
    </form>`;
}

function bindSearchForm() {
    const form = document.getElementById('search-form');
    if (!form) return;
    form.addEventListener('submit', event => {
        event.preventDefault();
        const data = new FormData(form);
        const type = data.get('type');
        const query = String(data.get('q') || '').trim();
        navigate(`search.html?type=${encodeURIComponent(type)}&q=${encodeURIComponent(query)}`);
    });
    // In modalità "Tutti i campi" il termine può essere vuoto (= sfoglia tutte).
    form.elements.type.addEventListener('change', () => {
        form.elements.q.required = form.elements.type.value !== 'all';
    });
}

/* =========================================================
 *  Navigazione e rendering della pagina corrente
 * ========================================================= */

function updateNav() {
    const user = DB.currentUser();
    document.querySelectorAll('[data-auth="user"]').forEach(el => { el.hidden = !user; });
    document.querySelectorAll('[data-auth="guest"]').forEach(el => { el.hidden = Boolean(user); });
    const navUser = document.getElementById('nav-user');
    if (user) navUser.textContent = '👤 ' + user.username;
    const active = document.body.dataset.page;
    document.querySelectorAll('#main-nav a[data-nav]').forEach(a => {
        a.classList.toggle('nav-active', a.dataset.nav === active);
    });
}

/**
 * (Ri)disegna la vista della pagina corrente dentro <main id="view">.
 * Viene richiamata anche dopo le azioni che modificano i dati, per
 * aggiornare la pagina senza ricaricarla.
 */
function render(keepPagination = false) {
    if (!keepPagination) App.state.shown = PAGE_SIZE;
    updateNav();
    const params = new URLSearchParams(location.search);
    const main = document.getElementById('view');
    main.innerHTML = Page.render(params);
    if (Page.bind) Page.bind(params);
    main.scrollIntoView({ block: 'start' });
}

/* =========================================================
 *  Azioni globali (event delegation)
 * ========================================================= */

document.addEventListener('click', event => {
    const target = event.target.closest('[data-action]');
    if (!target) return;
    const action = target.dataset.action;
    const user = DB.currentUser();

    switch (action) {
        case 'load-more':
            App.state.shown += PAGE_SIZE;
            render(true);
            break;

        case 'add-to-cookbook': {
            if (!user) { navigate('login.html'); return; }
            const recipeId = target.dataset.recipe;
            if (!user.cookbook.some(e => e.recipeId === recipeId)) {
                user.cookbook.push({ recipeId, addedAt: Date.now(), custom: null, notes: [] });
                DB.updateUser(user);
                toast('Ricetta aggiunta al ricettario!', 'success');
            }
            render();
            break;
        }

        case 'remove-from-cookbook': {
            if (!user) return;
            const recipeId = target.dataset.recipe;
            const recipe = DB.getRecipe(recipeId);
            // Per una ricetta creata dall'utente la rimozione è l'eliminazione
            // definitiva dall'archivio (requisito "cancellazione delle sue ricette").
            const ownsCustom = recipe && recipe.custom && recipe.ownerId === user.id;
            const message = ownsCustom
                ? 'Questa ricetta è stata creata da te: verrà eliminata definitivamente dalla piattaforma, anche dai ricettari degli altri utenti. Continuare?'
                : 'Rimuovere la ricetta dal ricettario? Le note private associate andranno perse.';
            if (!confirm(message)) return;
            if (ownsCustom) {
                DB.deleteRecipe(recipeId);
                toast('Ricetta eliminata definitivamente.', 'info');
            } else {
                user.cookbook = user.cookbook.filter(e => e.recipeId !== recipeId);
                DB.updateUser(user);
                toast('Ricetta rimossa dal ricettario.', 'info');
            }
            render();
            break;
        }

        case 'delete-note': {
            if (!user) return;
            const entry = user.cookbook.find(e => e.recipeId === target.dataset.recipe);
            if (!entry) return;
            entry.notes = entry.notes.filter(n => n.id !== target.dataset.note);
            DB.updateUser(user);
            toast('Nota eliminata.', 'info');
            render();
            break;
        }

        case 'remove-review': {
            if (!user) return;
            if (!confirm('Rimuovere questa recensione?')) return;
            DB.deleteReview(target.dataset.review, user.id);
            toast('Recensione rimossa.', 'info');
            render();
            break;
        }

        case 'toggle-edit': {
            const form = document.querySelector(`form.entry-edit-form[data-recipe="${CSS.escape(target.dataset.recipe)}"]`);
            if (form) form.hidden = !form.hidden;
            break;
        }

        case 'reset-custom': {
            if (!user) return;
            const entry = user.cookbook.find(e => e.recipeId === target.dataset.recipe);
            if (!entry) return;
            entry.custom = null;
            DB.updateUser(user);
            toast('Ricetta ripristinata alla versione originale.', 'info');
            render();
            break;
        }

        case 'delete-account': {
            if (!user) return;
            if (!confirm('Cancellare definitivamente il tuo profilo? L’operazione non è reversibile.')) return;
            Auth.deleteAccount(user.id);
            flash('Profilo cancellato. Ci vediamo presto!', 'info');
            navigate('index.html');
            break;
        }

        case 'reset-restart':
            App.state.resetEmail = null;
            App.state.resetQuestion = null;
            render();
            break;
    }
});

/* =========================================================
 *  Avvio della pagina
 * ========================================================= */

document.addEventListener('DOMContentLoaded', async () => {
    document.getElementById('logout-btn').addEventListener('click', () => {
        Auth.logout();
        flash('Sei uscito dal tuo account.', 'info');
        navigate('index.html');
    });

    // Guardia di autenticazione per le pagine riservate (ricettario, profilo).
    // middleware con js vanilla
    if (Page.requiresAuth && !DB.currentUser()) {
        flash('Devi effettuare l’accesso per questa sezione.', 'error');
        location.replace('login.html');
        return;
    }

    updateNav();

    // Seeding: al primo avvio scarica il dataset da TheMealDB nel Web Storage.
    const loadingMsg = document.getElementById('loading-msg');
    const result = await API.seedIfNeeded((done, total) => {
        if (loadingMsg) loadingMsg.textContent = `Caricamento delle ricette da TheMealDB… ${done}/${total}`;
    });

    if (!result.ok) {
        document.getElementById('view').innerHTML = `
            <section class="narrow center text-center">
                <h1>Impossibile caricare le ricette</h1>
                <p class="muted">Il download da TheMealDB non è riuscito e il Web Storage è vuoto.
                   Controlla la connessione e riprova.</p>
                <button type="button" class="btn btn-primary" onclick="location.reload()">Riprova</button>
            </section>`;
        return;
    }
    if (!result.fromCache) {
        toast(`${result.count} ricette scaricate e salvate nel Web Storage.`, 'success');
    }
    render();
    showFlash();
});
