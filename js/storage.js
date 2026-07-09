/**
 * storage.js — Livello di persistenza su Web Storage (localStorage, formato JSON).
 *
 * Modello dati:
 *  pgrc_users    : [{ id, username, email, passwordHash, salt, favoriteDishes[],
 *                     security: { question, answerHash },
 *                     cookbook: [{ recipeId, addedAt, custom: {name?, instructions?} | null,
 *                                  notes: [{ id, text, createdAt }] }],
 *                     createdAt }]
 *  pgrc_session  : { userId, loginAt } | null
 *  pgrc_recipes  : { "<idMeal>": { id, name, category, area, instructions, thumb,
 *                                  tags[], youtube, ingredients: [{name, measure}] } }
 *  pgrc_reviews  : [{ id, recipeId, userId, username, prepDate,
 *                     difficulty (1-5), taste (1-5), comment, createdAt }]
 *  pgrc_seeded_at: timestamp dell'ultimo download completo da TheMealDB
 */

const Storage = {
    read(key, fallback = null) {
        try {
            const raw = localStorage.getItem(key);
            return raw === null ? fallback : JSON.parse(raw);
        } catch (err) {
            console.error(`Errore in lettura di "${key}" dal Web Storage`, err);
            return fallback;
        }
    },
    write(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    },
    remove(key) {
        localStorage.removeItem(key);
    }
};

const DB = {
    KEYS: {
        USERS: 'pgrc_users',
        SESSION: 'pgrc_session',
        RECIPES: 'pgrc_recipes',
        REVIEWS: 'pgrc_reviews',
        SEEDED_AT: 'pgrc_seeded_at'
    },

    /* ---------- Utenti ---------- */

    getUsers() {
        return Storage.read(this.KEYS.USERS, []);
    },
    saveUsers(users) {
        Storage.write(this.KEYS.USERS, users);
    },
    getUserById(id) {
        return this.getUsers().find(u => u.id === id) || null;
    },
    findUserByEmail(email) {
        const needle = String(email).trim().toLowerCase();
        return this.getUsers().find(u => u.email.toLowerCase() === needle) || null;
    },
    findUserByUsername(username) {
        const needle = String(username).trim().toLowerCase();
        return this.getUsers().find(u => u.username.toLowerCase() === needle) || null;
    },
    addUser(user) {
        const users = this.getUsers();
        users.push(user);
        this.saveUsers(users);
    },
    updateUser(updated) {
        const users = this.getUsers().map(u => (u.id === updated.id ? updated : u));
        this.saveUsers(users);
    },
    deleteUser(id) {
        this.saveUsers(this.getUsers().filter(u => u.id !== id));
        // Rimuove anche le recensioni lasciate dall'utente.
        this.saveReviews(this.getReviews().filter(r => r.userId !== id));
    },

    /* ---------- Sessione ---------- */

    getSession() {
        return Storage.read(this.KEYS.SESSION, null);
    },
    setSession(userId) {
        Storage.write(this.KEYS.SESSION, { userId, loginAt: Date.now() });
    },
    clearSession() {
        Storage.remove(this.KEYS.SESSION);
    },
    currentUser() {
        const session = this.getSession();
        return session ? this.getUserById(session.userId) : null;
    },

    /* ---------- Ricette (cache da TheMealDB) ---------- */

    getRecipeMap() {
        return Storage.read(this.KEYS.RECIPES, {});
    },
    saveRecipeMap(map) {
        Storage.write(this.KEYS.RECIPES, map);
    },
    getRecipeList() {
        return Object.values(this.getRecipeMap())
            .sort((a, b) => a.name.localeCompare(b.name));
    },
    getRecipe(id) {
        return this.getRecipeMap()[id] || null;
    },
    upsertRecipes(recipes) {
        const map = this.getRecipeMap();
        recipes.forEach(r => { map[r.id] = r; });
        this.saveRecipeMap(map);
    },
    getSeededAt() {
        return Storage.read(this.KEYS.SEEDED_AT, null);
    },
    markSeeded() {
        Storage.write(this.KEYS.SEEDED_AT, Date.now());
    },

    /* ---------- Recensioni (pubbliche, visibili a tutti) ---------- */

    getReviews() {
        return Storage.read(this.KEYS.REVIEWS, []);
    },
    saveReviews(reviews) {
        Storage.write(this.KEYS.REVIEWS, reviews);
    },
    getReviewsForRecipe(recipeId) {
        return this.getReviews()
            .filter(r => r.recipeId === recipeId)
            .sort((a, b) => b.createdAt - a.createdAt);
    },
    addReview(review) {
        const reviews = this.getReviews();
        reviews.push(review);
        this.saveReviews(reviews);
    },
    deleteReview(reviewId, userId) {
        // Solo l'autore può rimuovere la propria recensione.
        this.saveReviews(this.getReviews().filter(r => !(r.id === reviewId && r.userId === userId)));
    }
};

/** Genera un id univoco (fallback se crypto.randomUUID non è disponibile). */
function uid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
}
