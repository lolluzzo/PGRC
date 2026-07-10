/**
 * pages/profile.js — Profilo utente (profile.html, richiede login).
 * Riepilogo dei dati personali, form di modifica (con cambio password
 * facoltativo) e cancellazione definitiva dell'account.
 */

const Page = {
    requiresAuth: true,
    render() {
        const user = DB.currentUser();
        const reviewCount = DB.getReviews().filter(r => r.userId === user.id).length;
        return `
        <section class="narrow">
            <h1>Il mio profilo</h1>
            <div class="panel profile-summary">
                <p><strong>Username:</strong> ${esc(user.username)}</p>
                <p><strong>Email:</strong> ${esc(user.email)}</p>
                <p><strong>Piatti preferiti:</strong> ${user.favoriteDishes.length
                    ? user.favoriteDishes.map(d => `<span class="tag">${esc(d)}</span>`).join(' ')
                    : '<span class="muted">nessuno indicato</span>'}</p>
                <p><strong>Iscritto dal:</strong> ${fmtDate(user.createdAt)}</p>
                <p><strong>Ricette nel ricettario:</strong> ${user.cookbook.length} ·
                   <strong>Recensioni pubblicate:</strong> ${reviewCount}</p>
            </div>

            <h2>Modifica dati personali</h2>
            <form id="profile-form" class="panel form-stack">
                <label class="form-label">Username
                    <input type="text" name="username" class="form-control" value="${esc(user.username)}" required minlength="3">
                </label>
                <label class="form-label">Email
                    <input type="email" name="email" class="form-control" value="${esc(user.email)}" required>
                </label>
                <label class="form-label">Piatti preferiti <span class="muted small">(separati da virgola)</span>
                    <input type="text" name="favoriteDishes" class="form-control" value="${esc(user.favoriteDishes.join(', '))}"
                           placeholder="es. Carbonara, Lasagne, Tiramisù">
                </label>
                <fieldset>
                    <legend>Cambio password <span class="muted small">(facoltativo)</span></legend>
                    <label class="form-label">Password attuale
                        <input type="password" name="currentPassword" class="form-control" autocomplete="current-password">
                    </label>
                    <label class="form-label">Nuova password
                        <input type="password" name="newPassword" class="form-control" minlength="6" autocomplete="new-password">
                    </label>
                    <label class="form-label">Conferma nuova password
                        <input type="password" name="newPasswordConfirm" class="form-control" autocomplete="new-password">
                    </label>
                </fieldset>
                <button type="submit" class="btn btn-primary">Salva modifiche</button>
            </form>

            <h2>Cancellazione</h2>
            <div class="panel danger-zone">
                <p class="muted">La cancellazione del profilo rimuove definitivamente account,
                   ricettario, note private e recensioni pubblicate.</p>
                <button type="button" class="btn btn-danger" data-action="delete-account">Cancella il mio profilo</button>
            </div>
        </section>`;
    },
    bind() {
        document.getElementById('profile-form').addEventListener('submit', async event => {
            event.preventDefault();
            const data = new FormData(event.target);
            try {
                await Auth.updateProfile(DB.getSession().userId, {
                    username: data.get('username'),
                    email: data.get('email'),
                    favoriteDishes: data.get('favoriteDishes'),
                    currentPassword: data.get('currentPassword'),
                    newPassword: data.get('newPassword'),
                    newPasswordConfirm: data.get('newPasswordConfirm')
                });
                toast('Profilo aggiornato con successo.', 'success');
                render();
            } catch (error) {
                toast(error.message, 'error');
            }
        });
    }
};
