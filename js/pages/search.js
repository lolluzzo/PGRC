/**
 * pages/search.js — Pagina di ricerca (search.html).
 * Legge i parametri dalla query string: ?type=name|ingredient|text|letter|all&q=…
 * Le ricerche operano sui dati già presenti nel Web Storage (vedi js/api.js).
 */

const Page = {
    render(params) {
        const type = params.get('type') || 'name';
        const query = params.get('q') || '';
        let results;
        let heading;
        switch (type) {
            case 'ingredient':
                results = API.searchByIngredient(query);
                heading = query ? `Ricette con ingrediente “${esc(query)}”` : 'Ricerca per ingrediente';
                break;
            case 'text':
                results = API.searchByText(query);
                heading = query ? `Ricette che parlano di “${esc(query)}”` : 'Ricerca per testo descrittivo';
                break;
            case 'letter':
                results = API.searchByLetter(query);
                heading = query ? `Ricette che iniziano per “${esc(query.toUpperCase())}”` : 'Tutte le ricette';
                break;
            case 'all':
                results = API.searchAll(query);
                heading = query ? `Risultati per “${esc(query)}” in tutti i campi` : 'Tutte le ricette';
                break;
            default:
                results = API.searchByName(query);
                heading = query ? `Risultati per “${esc(query)}”` : 'Tutte le ricette';
        }
        return `
        <section>
            <h1>Cerca ricette</h1>
            ${searchForm(type, query)}
            ${letterBar(type === 'letter' ? query.toLowerCase() : '')}
            <div class="section-head">
                <h2>${heading}</h2>
                <span class="muted">${results.length} risultat${results.length === 1 ? 'o' : 'i'}</span>
            </div>
            ${recipeGrid(results, { paginate: true })}
        </section>`;
    },
    bind() {
        bindSearchForm();
    }
};
