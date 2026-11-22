
export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({
            success: false,
            message: "Méthode non autorisée."
        });
    }

    try {
        const { content, instruction, type } = req.body || {};

        if (!content || !instruction) {
            return res.status(400).json({
                success: false,
                message: "Le contenu et la modification demandée sont obligatoires."
            });
        }

        const apiKey = process.env.OPENAI_API_KEY;

        if (!apiKey) {
            return res.status(500).json({
                success: false,
                message: "Clé API non configurée."
            });
        }

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
                    instructions: `
Tu es MangaVerse AI.
Tu aides à modifier des mangas originaux.
Respecte la demande de l'utilisateur.
Préserve les éléments qui ne doivent pas changer.
Retourne uniquement le contenu modifié.
                    `,
                    input: `
Type : ${type || "Manga"}

Contenu actuel :
${JSON.stringify(content)}

Modification demandée :
${instruction}
                    `
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error("Erreur API :", data);
            return res.status(502).json({
                success: false,
                message: "La modification IA a échoué."
            });
        }

        const revisedContent = data.output
            ?.flatMap(item => item.content || [])
            .find(item => item.type === "output_text")
            ?.text;

        if (!revisedContent) {
            throw new Error("Réponse IA vide.");
        }

        return res.status(200).json({
            success: true,
            revisedContent
        });

    } catch (error) {
        console.error("Erreur :", error);

        return res.status(500).json({
            success: false,
            message: "Une erreur est survenue."
        });
    }
}

