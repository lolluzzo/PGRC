/**
 * pages/login.js — Accesso (login.html).
 * Login con username oppure email; in caso di successo reindirizza alla home.
 */

const Page = {
    render() {
        return `
        <section class="narrow">
            <h1>Accedi</h1>
            <form id="login-form" class="panel form-stack">
                <label class="form-label">Username o email
                    <input type="text" name="identifier" class="form-control" required autocomplete="username">
                </label>
                <label class="form-label">Password
                    <input type="password" name="password" class="form-control" required autocomplete="current-password">
                </label>
                <button type="submit" class="btn btn-primary">Accedi</button>
                <p class="muted small">
                    <a href="reset.html">Password dimenticata?</a> ·
                    Non hai un account? <a href="register.html">Registrati</a>
                </p>
            </form>
        </section>`;
    },
    bind() {
        document.getElementById('login-form').addEventListener('submit', async event => {
            event.preventDefault();
            const data = new FormData(event.target);
            try {
                const user = await Auth.login(data.get('identifier'), data.get('password'));
                flash(`Bentornato, ${user.username}!`, 'success');
                navigate('index.html');
            } catch (error) {
                toast(error.message, 'error');
            }
        });
    }
};
