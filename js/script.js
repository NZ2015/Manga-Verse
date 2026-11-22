
"use strict";

const STORAGE_KEYS = {
    projects: "mangaverse_projects",
    characters: "mangaverse_characters",
    stories: "mangaverse_stories",
    worlds: "mangaverse_worlds",
    chapters: "mangaverse_chapters",
    panels: "mangaverse_panels"
};

function getStoredData(key) {
    try {
        const data = JSON.parse(localStorage.getItem(key));
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("Erreur de lecture :", error);
        return [];
    }
}

function saveStoredData(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error("Erreur de sauvegarde :", error);
        return false;
    }
}

function updateStatistics() {
    const values = {
        projectCount: STORAGE_KEYS.projects,
        characterCount: STORAGE_KEYS.characters,
        storyCount: STORAGE_KEYS.stories
    };

    Object.entries(values).forEach(([elementId, key]) => {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = getStoredData(key).length;
        }
    });
}

function displayProjects() {
    const container = document.getElementById("projectsContainer");
    if (!container) return;

    const projects = getStoredData(STORAGE_KEYS.projects);
    container.replaceChildren();

    if (!projects.length) {
        const message = document.createElement("div");
        message.className = "empty-projects";
        message.innerHTML = `
            <div class="empty-icon">✧</div>
            <h3>Aucun projet pour le moment</h3>
            <p>Ton prochain grand univers commence ici.</p>
            <a href="studio.html" class="secondary-button">
                Créer mon premier projet
            </a>
        `;
        container.appendChild(message);
        return;
    }

    projects.slice(-6).reverse().forEach(project => {
        const card = document.createElement("article");
        card.className = "stat-card project-card";

        const title = document.createElement("h3");
        title.textContent = project.title || "Projet sans titre";

        const type = document.createElement("p");
        type.textContent = project.type || "Manga";

        const description = document.createElement("p");
        description.textContent = project.description || "Aucune description.";

        const link = document.createElement("a");
        link.href = `editor.html?id=${encodeURIComponent(project.id)}`;
        link.className = "view-all";
        link.textContent = "Modifier le projet →";

        card.append(title, type, description, link);
        container.appendChild(card);
    });
}

function initializeDashboard() {
    updateStatistics();
    displayProjects();

    const exploreButton = document.getElementById("exploreBtn");
    if (exploreButton) {
        exploreButton.addEventListener("click", () => {
            window.location.href = "studio.html";
        });
    }
}

document.addEventListener("DOMContentLoaded", initializeDashboard);

window.MangaVerse = {
    STORAGE_KEYS,
    getStoredData,
    saveStoredData,
    updateStatistics,
    displayProjects
};
