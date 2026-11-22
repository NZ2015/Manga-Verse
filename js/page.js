
"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const configurations = [
        {
            form: "worldForm",
            container: "worldsContainer",
            key: "mangaverse_worlds",
            fields: ["worldName", "worldDescription", "worldPlaces", "worldRules"],
            labels: ["Nom", "Description", "Lieux", "Règles"]
        },
        {
            form: "storyForm",
            container: "storiesContainer",
            key: "mangaverse_stories",
            fields: ["storyTitle", "storySynopsis", "storyBeginning", "storyConflict"],
            labels: ["Titre", "Résumé", "Début", "Conflit"]
        },
        {
            form: "chapterForm",
            container: "chaptersContainer",
            key: "mangaverse_chapters",
            fields: ["chapterTitle", "chapterNumber", "chapterSummary"],
            labels: ["Titre", "Numéro", "Résumé"]
        },
        {
            form: "panelForm",
            container: "panelsContainer",
            key: "mangaverse_panels",
            fields: ["panelNumber", "panelDescription", "panelDialogue"],
            labels: ["Case", "Scène", "Dialogue"]
        }
    ];

    function readData(key) {
        try {
            return JSON.parse(localStorage.getItem(key)) || [];
        } catch {
            return [];
        }
    }

    function render(config) {
        const container = document.getElementById(config.container);
        if (!container) return;

        const items = readData(config.key);
        container.replaceChildren();

        if (!items.length) {
            const empty = document.createElement("p");
            empty.className = "empty-message";
            empty.textContent = "Aucun élément enregistré pour le moment.";
            container.appendChild(empty);
            return;
        }

        items.forEach(item => {
            const card = document.createElement("article");
            card.className = "stat-card project-card";

            config.labels.forEach(label => {
                const paragraph = document.createElement("p");
                paragraph.textContent = label + " : " + (item[label] || "");
                card.appendChild(paragraph);
            });

            const edit = document.createElement("button");
            edit.type = "button";
            edit.textContent = "Modifier";

            edit.addEventListener("click", () => {
                const form = document.getElementById(config.form);
                config.fields.forEach(field => {
                    const input = document.getElementById(field);
                    input.value = item[field] || "";
                });
                form.dataset.editing = item.id;
                form.scrollIntoView({ behavior: "smooth" });
            });

            const remove = document.createElement("button");
            remove.type = "button";
            remove.textContent = "Supprimer";

            remove.addEventListener("click", () => {
                if (!confirm("Supprimer cet élément ?")) return;
                localStorage.setItem(
                    config.key,
                    JSON.stringify(items.filter(entry => entry.id !== item.id))
                );
                render(config);
            });

            card.append(edit, remove);
            container.appendChild(card);
        });
    }

    configurations.forEach(config => {
        const form = document.getElementById(config.form);
        if (!form) return;

        form.addEventListener("submit", event => {
            event.preventDefault();

            const items = readData(config.key);
            const editingId = form.dataset.editing;

            const item = { id: editingId || crypto.randomUUID() };

            config.fields.forEach(field => {
                item[field] = document.getElementById(field).value.trim();
            });

            const index = items.findIndex(entry => entry.id === editingId);

            if (editingId && index !== -1) {
                items[index] = item;
            } else {
                items.push(item);
            }

            localStorage.setItem(config.key, JSON.stringify(items));

            delete form.dataset.editing;
            form.reset();
            render(config);
        });

        render(config);
    });
});
