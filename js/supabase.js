
"use strict";

// MangaVerse AI - Configuration Supabase

window.MangaVerseSupabaseReady = (async function () {
    try {
        // Récupérer la configuration depuis le serveur
        const response = await fetch("/api/supabase-config");

        if (!response.ok) {
            throw new Error("Impossible de récupérer la configuration Supabase.");
        }

        const config = await response.json();

        if (!config.url || !config.anonKey) {
            throw new Error("Configuration Supabase incomplète.");
        }

        // Vérifier que la bibliothèque Supabase est chargée
        if (!window.supabase || !window.supabase.createClient) {
            throw new Error("La bibliothèque Supabase n'est pas chargée.");
        }

        // Créer le client Supabase
        const client = window.supabase.createClient(
            config.url,
            config.anonKey
        );

        window.MangaVerseSupabase = client;

        console.log("Supabase connecté à MangaVerse AI.");

        return client;

    } catch (error) {
        console.error("Erreur Supabase :", error);
        throw error;
    }
})();
