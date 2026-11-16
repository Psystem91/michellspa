
const { createClient } =
  require("@supabase/supabase-js");

const pool = require("./database");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  }
);

async function requireAdmin(req, res, next) {
  const authorization =
    req.headers.authorization || "";

  const match =
    authorization.match(/^Bearer (.+)$/i);

  if (!match) {
    return res.status(401).json({
      error: "Debes iniciar sesión"
    });
  }

  try {
    const token = match[1];

    // Verificar el token en Supabase Auth.
    const { data, error } =
      await supabase.auth.getUser(token);

    if (error || !data.user) {
      return res.status(401).json({
        error: "Sesión inválida"
      });
    }

    // Comprobar autorización administrativa.
    const result = await pool.query(
      `SELECT usuario_id
       FROM public.administradores
       WHERE usuario_id = $1`,
      [data.user.id]
    );

    if (result.rowCount === 0) {
      return res.status(403).json({
        error: "Acceso no autorizado"
      });
    }

    req.adminUser = data.user;
    next();

  } catch (error) {
    console.error(
      "Error verificando administrador:",
      error.message
    );

    res.status(500).json({
      error: "No se pudo verificar el acceso"
    });
  }
}

module.exports = requireAdmin;
