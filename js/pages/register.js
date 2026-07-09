/**
 * pages/register.js — Registrazione (register.html).
 * Crea l'account (con domanda di sicurezza per il recupero password) e il
 * ricettario personale vuoto, poi reindirizza alla home già autenticato.
 */

const Page = {
    render() {
        return `
        <section class="narrow">
            <h1>Crea un account</h1>
            <p class="muted">Alla registrazione verrà creato automaticamente il tuo ricettario personale.</p>
            <form id="register-form" class="panel form-stack">
                <label class="form-label">Username
                    <input type="text" name="username" class="form-control" required minlength="3" autocomplete="username">
                </label>
                <label class="form-label">Email
                    <input type="email" name="email" class="form-control" required autocomplete="email">
                </label>
                <label class="form-label">Password <span class="muted small">(minimo 6 caratteri)</span>
                    <input type="password" name="password" class="form-control" required minlength="6" autocomplete="new-password">
                </label>
                <label class="form-label">Conferma password
                    <input type="password" name="passwordConfirm" class="form-control" required autocomplete="new-password">
                </label>
                <label class="form-label">Piatti preferiti <span class="muted small">(separati da virgola, facoltativo)</span>
                    <input type="text" name="favoriteDishes" class="form-control" placeholder="es. Carbonara, Sushi, Paella">
                </label>
                <fieldset>
                    <legend>Recupero password</legend>
                    <label class="form-label">Domanda di sicurezza
                        <select name="securityQuestion" class="form-select" required>
                            ${Auth.SECURITY_QUESTIONS.map(q => `<option value="${esc(q)}">${esc(q)}</option>`).join('')}
                        </select>
                    </label>
                    <label class="form-label">Risposta
                        <input type="text" name="securityAnswer" class="form-control" required>
                    </label>
                </fieldset>
                <button type="submit" class="btn btn-primary">Registrati</button>
                <p class="muted small">Hai già un account? <a href="login.html">Accedi</a></p>
            </form>
        </section>`;
    },
    bind() {
        document.getElementById('register-form').addEventListener('submit', async event => {
            event.preventDefault();
            const data = new FormData(event.target);
            try {
                const user = await Auth.register({
                    username: data.get('username'),
                    email: data.get('email'),
                    password: data.get('password'),
                    passwordConfirm: data.get('passwordConfirm'),
                    favoriteDishes: data.get('favoriteDishes'),
                    securityQuestion: data.get('securityQuestion'),
                    securityAnswer: data.get('securityAnswer')
                });
                flash(`Benvenuto, ${user.username}! Il tuo ricettario è pronto.`, 'success');
                navigate('index.html');
            } catch (error) {
                toast(error.message, 'error');
            }
        });
    }
};
