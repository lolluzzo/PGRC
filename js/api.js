/**
 * api.js — Integrazione con le API REST di TheMealDB.
 *
 * Allo startup l'applicazione scarica l'intero dataset delle ricette
 * (una richiesta per lettera iniziale a–z), lo normalizza e lo salva in
 * formato JSON nel Web Storage. Tutte le ricerche successive (per titolo,
 * ingrediente, testo descrittivo, lettera) operano sui dati locali.
 */

const API = {
    BASE: 'https://www.themealdb.com/api/json/v1/1',

    /** Converte il formato "piatto" di TheMealDB (strIngredient1..20) nel modello interno. */
    normalizeMeal(meal) {
        const ingredients = [];
        for (let i = 1; i <= 20; i++) {
            const name = meal['strIngredient' + i];
            const measure = meal['strMeasure' + i];
            if (name && name.trim()) {
                ingredients.push({ name: name.trim(), measure: (measure || '').trim() });
            }
        }
        return {
            id: meal.idMeal,
            name: meal.strMeal,
            category: meal.strCategory || '',
            area: meal.strArea || '',
            instructions: meal.strInstructions || '',
            thumb: meal.strMealThumb || '',
            tags: meal.strTags ? meal.strTags.split(',').map(t => t.trim()).filter(Boolean) : [],
            youtube: meal.strYoutube || '',
            ingredients
        };
    },

    async fetchJson(url) {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Errore HTTP ${response.status} su ${url}`);
        return response.json();
    },

    /** Scarica tutte le ricette che iniziano con una data lettera. */
    async fetchByLetter(letter) {
        const data = await this.fetchJson(`${this.BASE}/search.php?f=${encodeURIComponent(letter)}`);
        return (data.meals || []).map(m => this.normalizeMeal(m));
    },

    /** Ricerca remota per nome (usata come fallback se la cache locale non basta). */
    async fetchByName(query) {
        const data = await this.fetchJson(`${this.BASE}/search.php?s=${encodeURIComponent(query)}`);
        return (data.meals || []).map(m => this.normalizeMeal(m));
    },

    /**
     * Seeding allo startup: se il Web Storage è vuoto scarica il dataset
     * completo (a–z) e lo salva. Con la cache già popolata non rifà il download.
     * @param {(done:number, total:number)=>void} onProgress callback di avanzamento
     * @returns {{ok:boolean, fromCache:boolean, count:number, error?:Error}}
     */
    async seedIfNeeded(onProgress) {
        const cached = DB.getRecipeList();
        if (DB.getSeededAt() && cached.length > 0) {
            return { ok: true, fromCache: true, count: cached.length };
        }

        const letters = 'abcdefghijklmnopqrstuvwxyz'.split('');
        let done = 0;
        try {
            const results = await Promise.allSettled(
                letters.map(async letter => {
                    const meals = await this.fetchByLetter(letter);
                    done++;
                    if (onProgress) onProgress(done, letters.length);
                    return meals;
                })
            );
            const meals = results
                .filter(r => r.status === 'fulfilled')
                .flatMap(r => r.value);

            if (meals.length === 0) {
                throw new Error('Nessuna ricetta ricevuta da TheMealDB');
            }
            DB.upsertRecipes(meals);
            DB.markSeeded();
            return { ok: true, fromCache: false, count: DB.getRecipeList().length };
        } catch (error) {
            console.error('Seeding fallito', error);
            // Se esiste una cache parziale l'app resta comunque utilizzabile.
            const fallback = DB.getRecipeList();
            return { ok: fallback.length > 0, fromCache: true, count: fallback.length, error };
        }
    },

    /* ---------- Ricerche sui dati locali (Web Storage) ---------- */

    searchByName(query) {
        const q = query.trim().toLowerCase();
        if (!q) return DB.getRecipeList();
        return DB.getRecipeList().filter(r => r.name.toLowerCase().includes(q));
    },

    searchByIngredient(query) {
        const q = query.trim().toLowerCase();
        if (!q) return [];
        return DB.getRecipeList().filter(r =>
            r.ingredients.some(ing => ing.name.toLowerCase().includes(q))
        );
    },

    searchByText(query) {
        const q = query.trim().toLowerCase();
        if (!q) return [];
        return DB.getRecipeList().filter(r =>
            r.instructions.toLowerCase().includes(q) ||
            r.category.toLowerCase().includes(q) ||
            r.area.toLowerCase().includes(q) ||
            r.tags.some(t => t.toLowerCase().includes(q))
        );
    },

    searchByLetter(letter) {
        const l = letter.trim().toLowerCase();
        if (!l) return DB.getRecipeList();
        return DB.getRecipeList().filter(r => r.name.toLowerCase().startsWith(l));
    }
};
