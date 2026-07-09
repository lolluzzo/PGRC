/**
 * pages/home.js — Pagina iniziale (index.html).
 * Hero con ricerca rapida, barra delle lettere e anteprima di alcune ricette.
 */

const Page = {
    render() {
        const user = DB.currentUser();
        const recipes = DB.getRecipeList();
        const featured = recipes.slice(0, 8);
        return `
        <section class="hero">
            <h1>Piattaforma per la Gestione di Ricette di Cucina</h1>
            <p>${user
                ? `Bentornato, <strong>${esc(user.username)}</strong>! Cerca una ricetta o apri il tuo ricettario.`
                : `Cerca tra <strong>${recipes.length}</strong> ricette, salva le tue preferite nel ricettario personale e lascia le tue recensioni.`}
            </p>
            ${searchForm()}
            ${user ? '' : `<p class="hero-note">Non hai un account? <a href="register.html">Registrati gratis</a>.</p>`}
        </section>
        <section>
            <h2>Sfoglia per lettera</h2>
            ${letterBar()}
        </section>
        <section>
            <div class="section-head">
                <h2>Alcune ricette</h2>
                <a class="link" href="search.html?type=all">Vedi tutte →</a>
            </div>
            ${recipeGrid(featured)}
        </section>`;
    },
    bind() {
        bindSearchForm();
    }
};
