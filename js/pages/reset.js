/**
 * pages/reset.js — Recupero password (reset.html).
 * Procedura in due passi senza backend: 1) dall'email si ricava la domanda
 * di sicurezza; 2) risposta corretta → nuova password. Lo stato del passo
 * corrente vive in App.state e si azzera ricaricando la pagina.
 */

const Page = {
    render() {
        const { resetEmail, resetQuestion } = App.state;
        return `
        <section class="narrow">
            <h1>Recupera password</h1>
            ${!resetQuestion ? `
            <form id="reset-step1" class="panel form-stack">
                <p class="muted">Inserisci l'email del tuo account: ti mostreremo la tua domanda di sicurezza.</p>
                <label class="form-label">Email
                    <input type="email" name="email" class="form-control" required autocomplete="email">
                </label>
                <button type="submit" class="btn btn-primary">Continua</button>
            </form>` : `
            <form id="reset-step2" class="panel form-stack">
                <p>Account: <strong>${esc(resetEmail)}</strong></p>
                <p class="security-question">${esc(resetQuestion)}</p>
                <label class="form-label">Risposta di sicurezza
                    <input type="text" name="answer" class="form-control" required>
                </label>
                <label class="form-label">Nuova password <span class="muted small">(minimo 6 caratteri)</span>
                    <input type="password" name="newPassword" class="form-control" required minlength="6" autocomplete="new-password">
                </label>
                <label class="form-label">Conferma nuova password
                    <input type="password" name="newPasswordConfirm" class="form-control" required autocomplete="new-password">
                </label>
                <button type="submit" class="btn btn-primary">Reimposta password</button>
                <button type="button" class="btn" data-action="reset-restart">Usa un'altra email</button>
            </form>`}
        </section>`;
    },
    bind() {
        const step1 = document.getElementById('reset-step1');
        if (step1) {
            step1.addEventListener('submit', event => {
                event.preventDefault();
                const email = new FormData(step1).get('email');
                try {
                    App.state.resetQuestion = Auth.getSecurityQuestion(email);
                    App.state.resetEmail = email;
                    render();
                } catch (error) {
                    toast(error.message, 'error');
                }
            });
        }
        const step2 = document.getElementById('reset-step2');
        if (step2) {
            step2.addEventListener('submit', async event => {
                event.preventDefault();
                const data = new FormData(step2);
                try {
                    await Auth.resetPassword(
                        App.state.resetEmail,
                        data.get('answer'),
                        data.get('newPassword'),
                        data.get('newPasswordConfirm')
                    );
                    App.state.resetEmail = null;
                    App.state.resetQuestion = null;
                    flash('Password reimpostata: ora puoi accedere.', 'success');
                    navigate('login.html');
                } catch (error) {
                    toast(error.message, 'error');
                }
            });
        }
    }
};
