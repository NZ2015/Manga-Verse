
import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Méthode non autorisée."
    });
  }

  try {
    const { access_token, refresh_token } = req.body || {};

    if (!access_token || !refresh_token) {
      return res.status(400).json({
        success: false,
        message: "Session incomplète."
      });
    }

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      }
    );

    const { error: sessionError } =
      await supabase.auth.setSession({
        access_token,
        refresh_token
      });

    if (sessionError) {
      return res.status(401).json({
        success: false,
        message: "Session invalide."
      });
    }

    const { error } = await supabase.auth.signOut({
      scope: "global"
    });

    if (error) {
      throw error;
    }

    return res.status(200).json({
      success: true,
      message: "Déconnexion réussie."
    });

  } catch (error) {
    console.error("Logout error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Erreur lors de la déconnexion."
    });
  }
}
