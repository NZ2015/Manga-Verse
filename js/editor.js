
"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const titleInput = document.getElementById("editTitle");
    const storyInput = document.getElementById("editStory");
    const notesInput = document.getElementById("editNotes");
    const saveButton = document.getElementById("saveManga");
    const reviseButton = document.getElementById("requestRevision");
    const status = document.getElementById("editorStatus");

    if (!titleInput || !storyInput) return;

    const params = new URLSearchParams(window.location.search);
    const projectId = params.get("id");

    let projects = window.MangaVerse.getStoredData(
        window.MangaVerse.STORAGE_KEYS.projects
    );

    let project = projects.find(item => item.id === projectId);

    if (!project) {
        project = projects[projects.length - 1];
    }

    if (project) {
        titleInput.value = project.title || "";
        storyInput.value = project.description || "";
    } else {
        status.textContent = "Aucun projet trouvé. Crée d'abord un projet.";
    }

    function saveChanges() {
        if (!project) return false;

        projects = window.MangaVerse.getStoredData(
            window.MangaVerse.STORAGE_KEYS.projects
        );

        const index = projects.findIndex(item => item.id === project.id);
        if (index === -1) return false;

        projects[index] = {
            ...projects[index],
            title: titleInput.value.trim(),
            description: storyInput.value,
            updatedAt: new Date().toISOString()
        };

        const success = window.MangaVerse.saveStoredData(
            window.MangaVerse.STORAGE_KEYS.projects,
            projects
        );

        if (success) {
            project = projects[index];
            status.textContent = "Modifications enregistrées.";
            return true;
        }

        status.textContent = "Erreur pendant l'enregistrement.";
        return false;
    }

    if (saveButton) {
        saveButton.addEventListener("click", saveChanges);
    }

    if (reviseButton) {
        reviseButton.addEventListener("click", async () => {
            if (!project) return;

            const instructions = notesInput.value.trim();

            if (!instructions) {
                status.textContent = "Écris d'abord tes instructions.";
                return;
            }

            saveChanges();
            reviseButton.disabled = true;
            status.textContent = "Connexion au service IA nécessaire pour cette modification.";

            try {
                if (!window.MangaVerseAI) {
                    throw new Error("Service IA non chargé.");
                }

                const result = await window.MangaVerseAI.reviseContent(
                    storyInput.value,
                    instructions
                );

                if (typeof result.content === "string") {
                    storyInput.value = result.content;
                    saveChanges();
                    status.textContent = "Nouvelle proposition reçue. Tu peux encore la modifier.";
                } else {
                    throw new Error("Réponse IA invalide.");
                }
            } catch (error) {
                status.textContent = error.message;
            } finally {
                reviseButton.disabled = false;
            }
        });
    }
});
