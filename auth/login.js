
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Méthode non autorisée."
    });
  }

  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "E-mail et mot de passe obligatoires."
      });
    }

    const { data, error } =
      await supabase.auth.signInWithPassword({
        email: String(email).trim().toLowerCase(),
        password
      });

    if (error || !data.session) {
      return res.status(401).json({
        success: false,
        message: "Identifiants incorrects ou e-mail non confirmé."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Connexion réussie.",
      user: {
        id: data.user.id,
        email: data.user.email,
        username: data.user.user_metadata?.username || ""
      },
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at
      }
    });

  } catch (error) {
    console.error("Login error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Erreur lors de la connexion."
    });
  }
}

