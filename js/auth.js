/**
 * auth.js — Gestione del profilo utente: registrazione, login/logout,
 * modifica/cancellazione profilo e recupero password.
 *
 * Non essendoci un backend, il "reset password" avviene tramite domanda di
 * sicurezza scelta in fase di registrazione. Le password non sono mai salvate
 * in chiaro: viene memorizzato l'hash SHA-256 di (salt + password).
 */

const Auth = {
    EMAIL_RE: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
    MIN_PASSWORD: 6,
    MIN_USERNAME: 3,

    SECURITY_QUESTIONS: [
        'Qual è il nome del tuo primo animale domestico?',
        'Qual è il tuo piatto preferito della tua infanzia?',
        'In quale città sei nato/a?',
        'Qual è il cognome da nubile di tua madre?'
    ],

    async hash(text) {
        if (window.crypto && crypto.subtle) {
            const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
            return Array.from(new Uint8Array(buffer))
                .map(b => b.toString(16).padStart(2, '0'))
                .join('');
        }
        // Fallback (contesti non sicuri): hash non crittografico ma deterministico.
        let h = 0;
        for (let i = 0; i < text.length; i++) {
            h = (Math.imul(h, 31) + text.charCodeAt(i)) | 0;
        }
        return 'fb' + (h >>> 0).toString(16);
    },

    normalizeAnswer(answer) {
        return String(answer).trim().toLowerCase();
    },

    /**
     * Registra un nuovo utente. Alla registrazione viene creato
     * automaticamente il ricettario personale vuoto (requisito).
     * @throws {Error} con messaggio leggibile se la validazione fallisce
     */
    async register({ username, email, password, passwordConfirm, favoriteDishes, securityQuestion, securityAnswer }) {
        username = String(username || '').trim();
        email = String(email || '').trim();

        if (username.length < this.MIN_USERNAME) {
            throw new Error(`Lo username deve avere almeno ${this.MIN_USERNAME} caratteri.`);
        }
        if (!this.EMAIL_RE.test(email)) {
            throw new Error('Inserisci un indirizzo email valido.');
        }
        if (!password || password.length < this.MIN_PASSWORD) {
            throw new Error(`La password deve avere almeno ${this.MIN_PASSWORD} caratteri.`);
        }
        if (password !== passwordConfirm) {
            throw new Error('Le due password non coincidono.');
        }
        if (!securityQuestion || !String(securityAnswer || '').trim()) {
            throw new Error('Scegli una domanda di sicurezza e inserisci la risposta (serve per il recupero password).');
        }
        if (DB.findUserByUsername(username)) {
            throw new Error('Username già in uso, scegline un altro.');
        }
        if (DB.findUserByEmail(email)) {
            throw new Error('Esiste già un account con questa email.');
        }

        const salt = uid();
        const user = {
            id: uid(),
            username,
            email,
            salt,
            // cleanPassword: password,
            passwordHash: await this.hash(salt + password),
            favoriteDishes: this.parseDishes(favoriteDishes),
            security: {
                question: securityQuestion,
                answerHash: await this.hash(salt + this.normalizeAnswer(securityAnswer))
            },
            cookbook: [], // ricettario personale creato vuoto alla registrazione
            createdAt: Date.now()
        };
        DB.addUser(user);
        DB.setSession(user.id);
        return user;
    },

    parseDishes(raw) {
        return String(raw || '')
            .split(',')
            .map(d => d.trim())
            .filter(Boolean);
    },

    /** Login con username oppure email. */
    async login(identifier, password) {
        const user = DB.findUserByEmail(identifier) || DB.findUserByUsername(identifier);
        if (!user) throw new Error('Nessun account trovato con queste credenziali.');
        const hash = await this.hash(user.salt + password);
        if (hash !== user.passwordHash) throw new Error('Password errata.');
        DB.setSession(user.id);
        return user;
    },

    logout() {
        DB.clearSession();
    },

    /** Passo 1 del recupero password: dalla email si ottiene la domanda di sicurezza. */
    getSecurityQuestion(email) {
        const user = DB.findUserByEmail(email);
        if (!user) throw new Error('Nessun account associato a questa email.');
        return user.security.question;
    },

    /** Passo 2: risposta corretta → la password viene sostituita. */
    async resetPassword(email, answer, newPassword, newPasswordConfirm) {
        const user = DB.findUserByEmail(email);
        if (!user) throw new Error('Nessun account associato a questa email.');
        const answerHash = await this.hash(user.salt + this.normalizeAnswer(answer));
        if (answerHash !== user.security.answerHash) {
            throw new Error('Risposta di sicurezza errata.');
        }
        if (!newPassword || newPassword.length < this.MIN_PASSWORD) {
            throw new Error(`La nuova password deve avere almeno ${this.MIN_PASSWORD} caratteri.`);
        }
        if (newPassword !== newPasswordConfirm) {
            throw new Error('Le due password non coincidono.');
        }
        user.passwordHash = await this.hash(user.salt + newPassword);
        DB.updateUser(user);
        return user;
    },

    /** Modifica dei dati personali (username, email, piatti preferiti, password opzionale). */
    async updateProfile(userId, { username, email, favoriteDishes, currentPassword, newPassword, newPasswordConfirm }) {
        const user = DB.getUserById(userId);
        if (!user) throw new Error('Utente non trovato.');

        username = String(username || '').trim();
        email = String(email || '').trim();

        if (username.length < this.MIN_USERNAME) {
            throw new Error(`Lo username deve avere almeno ${this.MIN_USERNAME} caratteri.`);
        }
        if (!this.EMAIL_RE.test(email)) {
            throw new Error('Inserisci un indirizzo email valido.');
        }
        const usernameOwner = DB.findUserByUsername(username);
        if (usernameOwner && usernameOwner.id !== userId) {
            throw new Error('Username già in uso da un altro account.');
        }
        const emailOwner = DB.findUserByEmail(email);
        if (emailOwner && emailOwner.id !== userId) {
            throw new Error('Email già in uso da un altro account.');
        }

        if (newPassword) {
            const currentHash = await this.hash(user.salt + String(currentPassword || ''));
            if (currentHash !== user.passwordHash) {
                throw new Error('La password attuale non è corretta.');
            }
            if (newPassword.length < this.MIN_PASSWORD) {
                throw new Error(`La nuova password deve avere almeno ${this.MIN_PASSWORD} caratteri.`);
            }
            if (newPassword !== newPasswordConfirm) {
                throw new Error('Le due nuove password non coincidono.');
            }
            user.passwordHash = await this.hash(user.salt + newPassword);
        }

        const oldUsername = user.username;
        user.username = username;
        user.email = email;
        user.favoriteDishes = this.parseDishes(favoriteDishes);
        DB.updateUser(user);

        // Mantiene coerente lo username mostrato nelle recensioni già pubblicate.
        if (oldUsername !== username) {
            const reviews = DB.getReviews().map(r =>
                r.userId === userId ? { ...r, username } : r
            );
            DB.saveReviews(reviews);
        }
        return user;
    },

    /** Cancellazione del profilo: rimuove utente, sessione e sue recensioni. */
    deleteAccount(userId) {
        DB.deleteUser(userId);
        DB.clearSession();
    }
};
