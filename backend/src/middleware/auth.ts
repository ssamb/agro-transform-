import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

// Middleware d'authentification
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Récupération du token depuis le header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token requis' });
    }

    const token = authHeader.split(' ')[1];

    // Vérification du token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    // Ajout des infos utilisateur à la requête
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token invalide ou expiré' });
  }
};

// Middleware de vérification des rôles
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Permissions insuffisantes' });
    }

    next();
  };
};
