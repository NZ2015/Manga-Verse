
"use strict";

window.MangaVerseAI = {
    async generateManga(project) {
        const response = await fetch("/api/generate-manga", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(project)
        });

        if (!response.ok) {
            throw new Error("La génération IA est momentanément indisponible.");
        }

        return await response.json();
    },

    async reviseContent(content, instructions) {
        const response = await fetch("/api/revise-content", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                content,
                instructions
            })
        });

        if (!response.ok) {
            throw new Error("La modification IA a échoué.");
        }

        return await response.json();
    }
};
