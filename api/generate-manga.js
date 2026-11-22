
export default async function handler(req, res) {
    // Autoriser uniquement les requêtes POST
    if (req.method !== "POST") {
        return res.status(405).json({
            success: false,
            message: "Méthode non autorisée."
        });
    }

    try {
        const {
            idea,
            genre,
            style,
            chapters,
            atmosphere
        } = req.body || {};

        if (!idea || idea.trim().length < 10) {
            return res.status(400).json({
                success: false,
                message: "Décris ton idée en au moins 10 caractères."
            });
        }

        if (!process.env.OPENAI_API_KEY) {
            return res.status(500).json({
                success: false,
                message: "La clé API IA n'est pas configurée."
            });
        }

        const response = await fetch(
            "https://api.openai.com/v1/responses",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: "gpt-5",
                    instructions: `
Tu es MangaVerse AI, un assistant spécialisé dans
la création de mangas originaux.

Crée des univers, personnages et histoires originaux.
Ne reproduis pas les personnages ou intrigues d'œuvres existantes.

Réponds uniquement avec un objet JSON valide.
                    `,
                    input: `
Crée un concept complet de manga à partir de ces informations :

Idée : ${idea}
Genre : ${genre || "Aventure"}
Style graphique : ${style || "Noir et blanc"}
Nombre de chapitres souhaité : ${chapters || 12}
Ambiance : ${atmosphere || "Épique"}

Retourne un JSON avec cette structure :
{
  "title": "",
  "summary": "",
  "universe": "",
  "mainCharacter": {
    "name": "",
    "age": "",
    "personality": "",
    "appearance": "",
    "abilities": "",
    "goal": ""
  },
  "characters": [],
  "antagonist": {},
  "storyArc": "",
  "chapters": [
    {
      "number": 1,
      "title": "",
      "summary": ""
    }
  ],
  "visualStyle": ""
}
                    `
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error("Erreur OpenAI :", data);
            return res.status(502).json({
                success: false,
                message: "Le service IA n'a pas pu générer le manga."
            });
        }

        const outputText = data.output
            ?.flatMap(item => item.content || [])
            .find(item => item.type === "output_text")
            ?.text;

        if (!outputText) {
            throw new Error("Réponse IA vide.");
        }

        const manga = JSON.parse(outputText);

        return res.status(200).json({
            success: true,
            manga
        });

    } catch (error) {
        console.error("Erreur génération manga :", error);

        return res.status(500).json({
            success: false,
            message: "Une erreur est survenue pendant la création du manga."
        });
    }
}
