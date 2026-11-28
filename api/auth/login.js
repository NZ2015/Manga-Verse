
export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({
            success: false,
            message: "Méthode non autorisée."
        });
    }

    try {
        const url = process.env.SUPABASE_URL;
        const anonKey = process.env.SUPABASE_ANON_KEY;

        if (!url || !anonKey) {
            return res.status(500).json({
                success: false,
                message: "La configuration Supabase est incomplète."
            });
        }

        return res.status(200).json({
            success: true,
            url,
            anonKey
        });

    } catch (error) {
        console.error("Erreur de configuration Supabase :", error);

        return res.status(500).json({
            success: false,
            message: "Impossible de charger la configuration Supabase."
        });
    }
}
