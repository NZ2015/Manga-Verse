
"use strict";

// MangaVerse AI - Gestion de l'authentification

window.MangaVerseAuth = {

    async getClient() {
        return await window.MangaVerseSupabaseReady;
    },

    async getUser() {
        const supabase = await this.getClient();

        const { data, error } = await supabase.auth.getUser();

        if (error) {
            throw error;
        }

        return data.user;
    },

    async requireAuth() {
        try {
            const user = await this.getUser();

            if (!user) {
                window.location.replace("connexion.html");
                return null;
            }

            return user;

        } catch (error) {
            console.error("Vérification de session :", error);
            window.location.replace("connexion.html");
            return null;
        }
    },

    async logout() {
        try {
            const supabase = await this.getClient();

            const { error } = await supabase.auth.signOut();

            if (error) {
                throw error;
            }

            window.location.replace("connexion.html");

        } catch (error) {
            console.error("Erreur de déconnexion :", error);
            alert("Impossible de se déconnecter. Réessaie.");
        }
    }
};

// Déconnexion automatique des boutons concernés
document.addEventListener("click", function(event) {
    const button = event.target.closest("[data-logout]");

    if (button) {
        window.MangaVerseAuth.logout();
    }
});

// Protection automatique des pages marquées
document.addEventListener("DOMContentLoaded", async function() {
    if (document.body.dataset.protected === "true") {
        await window.MangaVerseAuth.requireAuth();
    }
});
