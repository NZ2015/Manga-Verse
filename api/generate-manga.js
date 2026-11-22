
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

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(
                data.message || "La génération du manga a échoué."
            );
        }

        return data;
    },

    async reviseContent(content, instruction, type = "Manga") {
        const response = await fetch("/api/revise-content", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                content,
                instruction,
                type
            })
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(
                data.message || "La modification du contenu a échoué."
            );
        }

        return data;
    }
};


        
