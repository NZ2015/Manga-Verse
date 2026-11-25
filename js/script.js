
"use strict";

/* ==========================================
   MANGAVERSE AI — CONFIGURATION
========================================== */

const STORAGE_KEYS = {
    projects: "mangaverse_projects",
    characters: "mangaverse_characters",
    stories: "mangaverse_stories",
    worlds: "mangaverse_worlds",
    chapters: "mangaverse_chapters",
    panels: "mangaverse_panels"
};

const AUTH_KEYS = {
    accessToken: "mangaverse_access_token",
    refreshToken: "mangaverse_refresh_token"
};

/* ==========================================
   STOCKAGE LOCAL
========================================== */

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

/* ==========================================
   STATISTIQUES
========================================== */

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

/* ==========================================
   AFFICHAGE DES PROJETS
========================================== */

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
        description.textContent =
            project.description || "Aucune description.";

        const link = document.createElement("a");

        link.href = `editor.html?id=${encodeURIComponent(project.id || "")}`;
        link.className = "view-all";
        link.textContent = "Modifier le projet →";

        card.append(title, type, description, link);

        container.appendChild(card);
    });
}

/* ==========================================
   OUTILS API
========================================== */

async function apiRequest(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {})
        }
    });

    let data = {};

    try {
        data = await response.json();
    } catch {
        data = {};
    }

    if (!response.ok) {
        throw new Error(
            data.message ||
            data.error ||
            "Une erreur est survenue. Réessaie."
        );
    }

    return data;
}

function getAccessToken() {
    return sessionStorage.getItem(AUTH_KEYS.accessToken);
}

function saveSession(data) {
    if (data.access_token) {
        sessionStorage.setItem(
            AUTH_KEYS.accessToken,
            data.access_token
        );
    }

    if (data.refresh_token) {
        sessionStorage.setItem(
            AUTH_KEYS.refreshToken,
            data.refresh_token
        );
    }
}

function clearSession() {
    sessionStorage.removeItem(AUTH_KEYS.accessToken);
    sessionStorage.removeItem(AUTH_KEYS.refreshToken);
}

/* ==========================================
   FENÊTRE AUTHENTIFICATION
========================================== */

const authModal = document.getElementById("authModal");

function showAuthMessage(message, type = "error") {
    const element = document.getElementById("authMessage");

    if (!element) return;

    element.textContent = message;
    element.className = `auth-message ${type}`;
    element.hidden = false;
}

function clearAuthMessage() {
    const element = document.getElementById("authMessage");

    if (!element) return;

    element.textContent = "";
    element.hidden = true;
}

function openAuthModal(mode = "login") {
    if (!authModal) return;

    authModal.hidden = false;
    authModal.classList.add("active", "show");

    setAuthMode(mode);
}

function closeAuthModal() {
    if (!authModal) return;

    authModal.classList.remove("active", "show");
    authModal.hidden = true;

    clearAuthMessage();
}

function setAuthMode(mode) {
    const registerForm = document.getElementById("registerForm");
    const loginForm = document.getElementById("loginForm");

    const title = document.getElementById("authTitle");
    const description = document.getElementById("authDescription");
    const switchText = document.getElementById("authSwitchText");
    const switchButton = document.getElementById("authSwitchBtn");

    const isRegister = mode === "register";

    if (registerForm) registerForm.hidden = !isRegister;
    if (loginForm) loginForm.hidden = isRegister;

    if (title) {
        title.textContent = isRegister
            ? "Créer un compte"
            : "Bienvenue sur MangaVerse AI";
    }

    if (description) {
        description.textContent = isRegister
            ? "Rejoins MangaVerse AI et commence à créer."
            : "Connecte-toi pour retrouver tes projets.";
    }

    if (switchText) {
        switchText.textContent = isRegister
            ? "Tu as déjà un compte ?"
            : "Tu n'as pas encore de compte ?";
    }

    if (switchButton) {
        switchButton.textContent = isRegister
            ? "Se connecter"
            : "Créer un compte";
    }

    clearAuthMessage();
}

/* ==========================================
   AFFICHAGE UTILISATEUR
========================================== */

function displayUser(user) {
    if (!user) return;

    const username =
        user.user_metadata?.username ||
        user.username ||
        user.email?.split("@")[0] ||
        "Utilisateur";

    const avatar = username.charAt(0).toUpperCase();

    const sidebarUsername =
        document.getElementById("sidebarUsername");

    const userAvatar =
        document.getElementById("userAvatar");

    const topAvatar =
        document.getElementById("topAvatar");

    const sidebarPlan =
        document.getElementById("sidebarPlan");

    if (sidebarUsername) {
        sidebarUsername.textContent = username;
    }

    if (userAvatar) {
        userAvatar.textContent = avatar;
    }

    if (topAvatar) {
        topAvatar.textContent = avatar;
    }

    if (sidebarPlan) {
        sidebarPlan.textContent = "Plan gratuit";
    }

    const openLoginBtn = document.getElementById("openLoginBtn");
    const openRegisterBtn = document.getElementById("openRegisterBtn");

    if (openLoginBtn) openLoginBtn.hidden = true;
    if (openRegisterBtn) openRegisterBtn.hidden = true;

    const logoutBtn = document.getElementById("logoutBtn");

    if (logoutBtn) logoutBtn.hidden = false;

    closeAuthModal();
}

function displayGuest() {
    const sidebarUsername =
        document.getElementById("sidebarUsername");

    const userAvatar =
        document.getElementById("userAvatar");

    const topAvatar =
        document.getElementById("topAvatar");

    const sidebarPlan =
        document.getElementById("sidebarPlan");

    if (sidebarUsername) {
        sidebarUsername.textContent = "Visiteur";
    }

    if (userAvatar) userAvatar.textContent = "?";
    if (topAvatar) topAvatar.textContent = "?";

    if (sidebarPlan) {
        sidebarPlan.textContent = "Non connecté";
    }

    const openLoginBtn = document.getElementById("openLoginBtn");
    const openRegisterBtn = document.getElementById("openRegisterBtn");
    const logoutBtn = document.getElementById("logoutBtn");

    if (openLoginBtn) openLoginBtn.hidden = false;
    if (openRegisterBtn) openRegisterBtn.hidden = false;
    if (logoutBtn) logoutBtn.hidden = true;
}

/* ==========================================
   INSCRIPTION
========================================== */

async function handleRegister(event) {
    event.preventDefault();

    const username =
        document.getElementById("registerUsername")?.value.trim();

    const email =
        document.getElementById("registerEmail")?.value.trim();

    const password =
        document.getElementById("registerPassword")?.value;

    if (!username || !email || !password) {
        showAuthMessage("Remplis tous les champs.");
        return;
    }

    if (password.length < 12) {
        showAuthMessage(
            "Le mot de passe doit contenir au moins 12 caractères."
        );
        return;
    }

    const button = document.querySelector(
        "#registerForm button[type='submit']"
    );

    if (button) button.disabled = true;

    try {
        const data = await apiRequest("/api/auth/register", {
            method: "POST",
            body: JSON.stringify({
                username,
                email,
                password
            })
        });

        if (data.access_token) {
            saveSession(data);

            const user = data.user || data.data?.user;

            if (user) {
                displayUser(user);
            }
        } else {
            showAuthMessage(
                "Inscription réussie ! Vérifie ton adresse e-mail si une confirmation est demandée.",
                "success"
            );
        }

    } catch (error) {
        showAuthMessage(error.message);
    } finally {
        if (button) button.disabled = false;
    }
}

/* ==========================================
   CONNEXION
========================================== */

async function handleLogin(event) {
    event.preventDefault();

    const email =
        document.getElementById("loginEmail")?.value.trim();

    const password =
        document.getElementById("loginPassword")?.value;

    if (!email || !password) {
        showAuthMessage("Entre ton adresse e-mail et ton mot de passe.");
        return;
    }

    const button = document.querySelector(
        "#loginForm button[type='submit']"
    );

    if (button) button.disabled = true;

    try {
        const data = await apiRequest("/api/auth/login", {
            method: "POST",
            body: JSON.stringify({
                email,
                password
            })
        });

        saveSession(data);

        const user = data.user || data.data?.user;

        if (!user) {
            throw new Error(
                "Connexion effectuée, mais les informations utilisateur sont absentes."
            );
        }

        displayUser(user);

    } catch (error) {
        showAuthMessage(error.message);
    } finally {
        if (button) button.disabled = false;
    }
}

/* ==========================================
   VÉRIFICATION DE SESSION
========================================== */

async function checkAuthSession() {
    const token = getAccessToken();

    if (!token) {
        displayGuest();
        return;
    }

    try {
        const data = await apiRequest("/api/auth/me", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const user = data.user || data.data?.user;

        if (!user) {
            throw new Error("Session invalide.");
        }

        displayUser(user);

    } catch (error) {
        console.warn("Session expirée :", error.message);

        clearSession();
        displayGuest();
    }
}

/* ==========================================
   DÉCONNEXION
========================================== */

async function logout() {
    const accessToken = getAccessToken();

    const refreshToken =
        sessionStorage.getItem(AUTH_KEYS.refreshToken);

    try {
        if (accessToken) {
            await apiRequest("/api/auth/logout", {
                method: "POST",
                body: JSON.stringify({
                    access_token: accessToken,
                    refresh_token: refreshToken
                })
            });
        }
    } catch (error) {
        console.error("Erreur de déconnexion :", error);
    } finally {
        clearSession();
        displayGuest();
    }
}

/* ==========================================
   ÉVÉNEMENTS AUTHENTIFICATION
========================================== */

function initializeAuthentication() {
    const openLoginBtn = document.getElementById("openLoginBtn");
    const openRegisterBtn = document.getElementById("openRegisterBtn");

    const closeAuthBtn = document.getElementById("closeAuthBtn");
    const switchButton = document.getElementById("authSwitchBtn");

    const registerForm = document.getElementById("registerForm");
    const loginForm = document.getElementById("loginForm");

    const logoutBtn = document.getElementById("logoutBtn");

    if (openLoginBtn) {
        openLoginBtn.addEventListener("click", () => {
            openAuthModal("login");
        });
    }

    if (openRegisterBtn) {
        openRegisterBtn.addEventListener("click", () => {
            openAuthModal("register");
        });
    }

    if (closeAuthBtn) {
        closeAuthBtn.addEventListener("click", closeAuthModal);
    }

    if (switchButton) {
        switchButton.addEventListener("click", () => {
            const registerForm = document.getElementById("registerForm");

            setAuthMode(
                registerForm?.hidden ? "register" : "login"
            );
        });
    }

    if (registerForm) {
        registerForm.addEventListener("submit", handleRegister);
    }

    if (loginForm) {
        loginForm.addEventListener("submit", handleLogin);
    }

    if (logoutBtn) {
        logoutBtn.addEventListener("click", logout);
    }

    if (authModal) {
        authModal.addEventListener("click", event => {
            if (event.target === authModal) {
                closeAuthModal();
            }
        });
    }

    checkAuthSession();
}

/* ==========================================
   INITIALISATION DU TABLEAU DE BORD
========================================== */

function initializeDashboard() {
    updateStatistics();
    displayProjects();

    const exploreButton = document.getElementById("exploreBtn");

    if (exploreButton) {
        exploreButton.addEventListener("click", () => {
            window.location.href = "studio.html";
        });
    }

    initializeAuthentication();
}

/* ==========================================
   DÉMARRAGE
========================================== */

document.addEventListener("DOMContentLoaded", initializeDashboard);

/* ==========================================
   API PUBLIQUE MANGAVERSE
========================================== */

window.MangaVerse = {
    STORAGE_KEYS,
    getStoredData,
    saveStoredData,
    updateStatistics,
    displayProjects,
    openAuthModal,
    closeAuthModal,
    checkAuthSession,
    logout
};
