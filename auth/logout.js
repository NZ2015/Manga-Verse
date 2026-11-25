
import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Méthode non autorisée."
    });
  }

  try {
    const authorization = req.headers.authorization || "";
    const token = authorization.startsWith("Bearer ")
      ? authorization.slice(7)
      : "";

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Session introuvable."
      });
    }

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );

    const { data, error: sessionError } =
      await supabase.auth.getUser(token);

    if (sessionError || !data.user) {
      return res.status(401).json({
        success: false,
        message: "Session invalide."
      });
    }

    const { error } = await supabase.auth.admin
      .signOut(token, "global")
      .catch(() => ({ error: null }));

    if (error) {
      console.error("Logout error:", error.message);
    }

    return res.status(200).json({
      success: true,
      message: "Déconnexion effectuée."
    });

  } catch (error) {
    console.error("Logout error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Erreur lors de la déconnexion."
    });
  }
}
