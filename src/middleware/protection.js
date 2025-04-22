require("dotenv").config();
const jwt = require('jsonwebtoken');

const { JWTKEY } = process.env;
const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1] || 
                  req.cookies?.token || 
                  req.body?.token;
    
    if (!token) {
      return res.status(401).json({ message: "ASe requiere autenticación" });
    }
    try {
      const decoded = jwt.verify(token, JWTKEY);
      console.log(decoded)
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ message: "Token invalido", error: error.message });
    }
  };
  
  const checkRole = (allowedRoles) => {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({ message: "Se requiere autenticación" });
      }
      
      if (allowedRoles.includes(req.user.role) || req.user.role === 'admin') {
        next();
      } else {
        return res.status(403).json({ message: "Acceso denegado. Permisos insuficientes." });
      }
    };
  };

  module.exports = {
    checkRole,
    authMiddleware
  }