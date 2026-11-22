
export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({
            success: false,
            message: "Méthode non autorisée."
        });
    }

    try {
        const {
            title,
            idea,
            genre,
            style,
            chapters,
            atmosphere,
            features
        } = req.body || {};

        if (!idea || typeof idea !== "string" || idea.trim().length < 10) {
            return res.status(400).json({
                success: false,
                message: "L'idée du manga doit contenir au moins 10 caractères."
            });
        }

        const apiKey = process.env.OPENAI_API_KEY;

        if (!apiKey) {
            return res.status(500).json({
                success: false,
                message: "La clé API n'est pas configurée."
            });
        }

        const prompt = `
Crée un manga original et détaillé.

Titre : ${title || "À inventer"}
Idée : ${idea}
Genre : ${genre || "Aventure"}
Style : ${style || "Noir et blanc"}
Nombre de chapitres : ${chapters || 12}
Ambiance : ${atmosphere || "Épique"}
Éléments souhaités : ${Array.isArray(features) ? features.join(", ") : "Aucun"}

Retourne uniquement un JSON valide avec cette structure :

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
  "chapters": [],
  "visualStyle": ""
}

Crée un univers, des personnages et une intrigue originaux.
Respecte le nombre de chapitres demandé.
`;

        const response = await fetch(
            "https://api.openai.com/v1/responses",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: "gpt-5",
                    instructions: "Tu es MangaVerse AI, un expert en création de mangas originaux. Réponds uniquement avec un JSON valide.",
                    input: prompt
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error("Erreur OpenAI :", data);

            return res.status(502).json({
                success: false,
                message: "Le service IA a rencontré une erreur."
            });
        }

        const output = data.output
            ?.flatMap(item => item.content || [])
            .find(item => item.type === "output_text")
            ?.text;

        if (!output) {
            throw new Error("La réponse de l'IA est vide.");
        }

        const manga = JSON.parse(output);

        return res.status(200).json({
            success: true,
            manga
        });

    } catch (error) {
        console.error("Erreur MangaVerse AI :", error);

        return res.status(500).json({
            success: false,
            message: "Une erreur est survenue pendant la génération."
        });
    }
}
