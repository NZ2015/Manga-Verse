
"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("characterForm");
    const container = document.getElementById("charactersContainer");
    if (!form || !container) return;

    const KEY = "mangaverse_characters";

    function loadCharacters() {
        try {
            return JSON.parse(localStorage.getItem(KEY)) || [];
        } catch {
            return [];
        }
    }

    function saveCharacters(characters) {
        localStorage.setItem(KEY, JSON.stringify(characters));
    }

    function renderCharacters() {
        const characters = loadCharacters();
        container.replaceChildren();

        if (!characters.length) {
            container.innerHTML =
                '<p class="empty-message">Aucun personnage créé pour le moment.</p>';
            return;
        }

        characters.forEach(character => {
            const card = document.createElement("article");
            card.className = "stat-card project-card";

            const title = document.createElement("h3");
            title.textContent = character.name;

            const role = document.createElement("p");
            role.textContent = "Rôle : " + character.role;

            const appearance = document.createElement("p");
            appearance.textContent = "Apparence : " + character.appearance;

            const personality = document.createElement("p");
            personality.textContent = "Personnalité : " + character.personality;

            const powers = document.createElement("p");
            powers.textContent = "Capacités : " + character.power;

            const edit = document.createElement("button");
            edit.textContent = "Modifier";
            edit.type = "button";
            edit.addEventListener("click", () => {
                form.elements.characterName.value = character.name;
                form.elements.characterRole.value = character.role;
                form.elements.characterPersonality.value = character.personality;
                form.elements.characterAppearance.value = character.appearance;
                form.elements.characterPower.value = character.power;
                form.dataset.editing = character.id;
                form.scrollIntoView({ behavior: "smooth" });
            });

            const remove = document.createElement("button");
            remove.textContent = "Supprimer";
            remove.type = "button";
            remove.addEventListener("click", () => {
                if (!confirm("Supprimer ce personnage ?")) return;
                saveCharacters(loadCharacters().filter(item => item.id !== character.id));
                renderCharacters();
            });

            card.append(title, role, appearance, personality, powers, edit, remove);
            container.appendChild(card);
        });
    }

    form.addEventListener("submit", event => {
        event.preventDefault();

        const characters = loadCharacters();
        const editingId = form.dataset.editing;

        const character = {
            id: editingId || crypto.randomUUID(),
            name: form.elements.characterName.value.trim(),
            role: form.elements.characterRole.value,
            personality: form.elements.characterPersonality.value.trim(),
            appearance: form.elements.characterAppearance.value.trim(),
            power: form.elements.characterPower.value.trim()
        };

        if (editingId) {
            const index = characters.findIndex(item => item.id === editingId);
            if (index !== -1) characters[index] = character;
        } else {
            characters.push(character);
        }

        saveCharacters(characters);
        delete form.dataset.editing;
        form.reset();
        renderCharacters();
    });

    renderCharacters();
});
