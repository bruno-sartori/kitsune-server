"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_1 = __importDefault(require("../config/auth"));
// Middleware para verificar o token de acesso
function authMiddleware(req, res, next) {
    // Verificar se o token está presente no cabeçalho Authorization
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    if (!token) {
        return res.status(401).json({ message: 'Access token missing or invalid' });
    }
    console.log('AUTH Middleware');
    // Verificar o token
    jsonwebtoken_1.default.verify(token, auth_1.default.secret, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token' });
        }
        // Se o token for válido, anexar as informações do usuário na requisição
        req.user = user;
        next(); // Prosseguir para a rota protegida
    });
}
exports.default = authMiddleware;
