
import { createClient } from "@supabase/supabase-js";

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

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Méthode non autorisée."
    });
  }

  try {
    const { email, password, username } = req.body || {};

    if (!email || !password || !username) {
      return res.status(400).json({
        success: false,
        message: "Tous les champs sont obligatoires."
      });
    }

    if (typeof password !== "string" || password.length < 12) {
      return res.status(400).json({
        success: false,
        message: "Le mot de passe doit contenir au moins 12 caractères."
      });
    }

    const cleanUsername = String(username).trim();

    if (cleanUsername.length < 3 || cleanUsername.length > 30) {
      return res.status(400).json({
        success: false,
        message: "Nom d'utilisateur invalide."
      });
    }

    const { data, error } = await supabase.auth.signUp({
      email: String(email).trim().toLowerCase(),
      password,
      options: {
        data: {
          username: cleanUsername
        }
      }
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    return res.status(201).json({
      success: true,
      message: data.session
        ? "Compte créé avec succès."
        : "Compte créé. Vérifiez votre adresse e-mail.",
      user: {
        id: data.user?.id,
        email: data.user?.email,
        username: cleanUsername
      },
      access_token: data.session?.access_token || null,
      refresh_token: data.session?.refresh_token || null,
      expires_at: data.session?.expires_at || null,
      requiresEmailConfirmation: !data.session
    });

  } catch (error) {
    console.error("Register error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Erreur lors de la création du compte."
    });
  }
}

