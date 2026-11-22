
/* =========================================
   MangaVerse AI — Dashboard
   Gestion du tableau de bord
========================================= */

"use strict";

// Clés de stockage
const STORAGE_KEYS = {
    projects: "mangaverse_projects",
    characters: "mangaverse_characters",
    stories: "mangaverse_stories"
};

// Récupération des données
function getStoredData(key) {
    try {
        const data = JSON.parse(localStorage.getItem(key));
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("Erreur de lecture :", key, error);
        return [];
    }
}

// Sauvegarde des données
function saveStoredData(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error("Erreur de sauvegarde :", error);
        return false;
    }
}

// Mise à jour des statistiques
function updateStatistics() {
    const projects = getStoredData(STORAGE_KEYS.projects);
    const characters = getStoredData(STORAGE_KEYS.characters);
    const stories = getStoredData(STORAGE_KEYS.stories);

    document.getElementById("projectCount").textContent =
        projects.length;

    document.getElementById("characterCount").textContent =
        characters.length;

    document.getElementById("storyCount").textContent =
        stories.length;
}

// Affichage des projets
function displayProjects() {
    const container = document.getElementById("projectsContainer");

    if (!container) return;

    const projects = getStoredData(STORAGE_KEYS.projects);

    container.innerHTML = "";

    if (projects.length === 0) {
        container.innerHTML = `
            <div class="empty-projects">
                <div class="empty-icon">✧</div>
                <h3>Aucun projet pour le moment</h3>
                <p>Ton prochain grand univers commence ici.</p>
                <a href="studio.html" class="secondary-button">
                    Créer mon premier projet
                </a>
            </div>
        `;
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
        description.textContent =
            project.description || "Aucune description.";

        const link = document.createElement("a");
        link.href = "studio.html";
        link.className = "view-all";
        link.textContent = "Ouvrir le studio →";

        card.append(title, type, description, link);
        container.appendChild(card);
    });
}

// Bouton Explorer
function initializeButtons() {
    const exploreButton = document.getElementById("exploreBtn");

    if (exploreButton) {
        exploreButton.addEventListener("click", () => {
            window.location.href = "studio.html";
        });
    }
}

// Initialisation du tableau de bord
function initializeDashboard() {
    updateStatistics();
    displayProjects();
    initializeButtons();

    console.log("MangaVerse AI : tableau de bord chargé.");
}

// Démarrage
document.addEventListener("DOMContentLoaded", initializeDashboard);

// Fonctions réutilisables par les autres pages
window.MangaVerse = {
    getStoredData,
    saveStoredData,
    updateStatistics,
    displayProjects,
    STORAGE_KEYS
};
