import jwt from 'jsonwebtoken';
import authConfig from '../config/auth';
import { NextFunction, Request, Response } from 'express';

// Middleware para verificar o token de acesso
function authMiddleware(req: Request, res: Response, next: NextFunction) {
  // Verificar se o token está presente no cabeçalho Authorization
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Access token missing or invalid' });
  }

  console.log('AUTH Middleware');

  // Verificar o token
  jwt.verify(token, authConfig.secret, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }

    // Se o token for válido, anexar as informações do usuário na requisição
    req.user = user;
    next(); // Prosseguir para a rota protegida
  });
}

export default authMiddleware;
