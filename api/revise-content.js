
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
Tu es MangaVerse AI, un assistant de création de mangas.

Ta mission est de modifier le contenu fourni selon la demande
de l'utilisateur, tout en préservant les éléments qui ne sont
pas concernés par la modification.

Crée uniquement du contenu original.
Retourne uniquement le contenu révisé, sans commentaire inutile.
                    `,
                    input: `
Type de contenu : ${type || "Manga"}

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
            console.error("Erreur OpenAI :", data);
            return res.status(502).json({
                success: false,
                message: "Impossible de modifier le contenu pour le moment."
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
        console.error("Erreur de modification :", error);

        return res.status(500).json({
            success: false,
            message: "Une erreur est survenue pendant la modification."
        });
    }
}
