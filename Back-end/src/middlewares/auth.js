import jwt from "jsonwebtoken";
import { pool } from '../database/connection.js';

export function auth(requiredRoles = []) {
  return async (req, res, next) => {
    const header = req.headers.authorization;

    if (!header?.startsWith("Bearer ")) {
      return res.status(401).json({ erro: "Token não informado." });
    }

    try {
      const token = header.slice(7);
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      const [users] = await pool.query('SELECT id_usuario, id_escola, tipo_usuario FROM usuario WHERE id_usuario = ? AND ativo = 1', [payload.id_usuario]);
      if (!users.length) return res.status(401).json({ erro: 'Sessão inválida.' });
      const user = users[0];

      if (requiredRoles.length && !requiredRoles.includes(user.tipo_usuario)) {
        return res.status(403).json({ erro: "Usuário sem permissão para esta operação." });
      }

      req.user = user;
      next();
    } catch (error) {
      if (!['JsonWebTokenError', 'TokenExpiredError', 'NotBeforeError'].includes(error.name)) return next(error);
      return res.status(401).json({ erro: "Token inválido ou expirado." });
    }
  };
}
