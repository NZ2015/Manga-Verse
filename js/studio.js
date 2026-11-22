
"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("mangaForm");
    const button = document.getElementById("generateManga");
    const status = document.getElementById("generationStatus");
    const result = document.getElementById("generationResult");
    const resultContent = document.getElementById("resultContent");

    if (!form || !button || !status || !result || !resultContent) {
        console.error("Un élément du formulaire MangaVerse AI est introuvable.");
        return;
    }

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const idea = document.getElementById("mangaIdea").value.trim();
        const title = document.getElementById("mangaTitle").value.trim();
        const genre = document.getElementById("mangaGenre").value;
        const style = document.getElementById("mangaStyle").value;
        const chapters = Number(document.getElementById("chapterCount").value);
        const atmosphere = document.getElementById("mangaTone").value;

        const features = Array.from(
            form.querySelectorAll('input[name="features"]:checked')
        ).map(input => input.value);

        if (!title || idea.length < 10) {
            status.textContent = "Ajoute un titre et une idée d'au moins 10 caractères.";
            return;
        }

        if (!Number.isInteger(chapters) || chapters < 1 || chapters > 100) {
            status.textContent = "Choisis entre 1 et 100 chapitres.";
            return;
        }

        button.disabled = true;
        button.textContent = "✦ Création en cours...";
        status.textContent = "MangaVerse AI prépare ton univers...";
        result.hidden = true;

        try {
            const response = await fetch("/api/generate-manga", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    idea,
                    title,
                    genre,
                    style,
                    chapters,
                    atmosphere,
                    features
                })
            });

            const data = await response.json();

            if (!response.ok || !data.success || !data.manga) {
                throw new Error(data.message || "La génération a échoué.");
            }

            const manga = data.manga;

            const project = {
                id: "manga-" + Date.now(),
                title: manga.title || title,
                type: "Manga",
                description: manga.summary || idea,
                idea,
                genre,
                style,
                chapters: manga.chapters || [],
                characters: manga.characters || [],
                universe: manga.universe || "",
                antagonist: manga.antagonist || {},
                storyArc: manga.storyArc || "",
                visualStyle: manga.visualStyle || style,
                features,
                createdAt: new Date().toISOString()
            };

            if (window.MangaVerse) {
                const projects = MangaVerse.getStoredData(
                    MangaVerse.STORAGE_KEYS.projects
                );

                projects.push(project);

                if (!MangaVerse.saveStoredData(
                    MangaVerse.STORAGE_KEYS.projects,
                    projects
                )) {
                    throw new Error("Impossible de sauvegarder le projet.");
                }
            } else {
                throw new Error("Le système de sauvegarde est indisponible.");
            }

            resultContent.replaceChildren();

            function addSection(heading, content) {
                if (!content) return;

                const section = document.createElement("section");
                const titleElement = document.createElement("h3");
                const paragraph = document.createElement("p");

                titleElement.textContent = heading;
                paragraph.textContent = typeof content === "string"
                    ? content
                    : JSON.stringify(content, null, 2);

                section.append(titleElement, paragraph);
                resultContent.appendChild(section);
            }

            addSection("Titre", project.title);
            addSection("Résumé", project.description);
            addSection("Univers", project.universe);
            addSection("Personnage principal", manga.mainCharacter);
            addSection("Personnages", project.characters);
            addSection("Antagoniste", project.antagonist);
            addSection("Intrigue", project.storyArc);
            addSection("Chapitres", project.chapters);
            addSection("Style graphique", project.visualStyle);

            result.hidden = false;
            status.textContent = "Ton manga a été créé et sauvegardé !";

            if (window.MangaVerse.updateStatistics) {
                MangaVerse.updateStatistics();
            }

        } catch (error) {
            console.error("Erreur MangaVerse AI :", error);
            status.textContent = error.message ||
                "Une erreur est survenue pendant la création.";
        } finally {
            button.disabled = false;
            button.textContent = "✦ Préparer mon manga";
        }
    });
});

