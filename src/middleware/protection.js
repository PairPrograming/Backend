require("dotenv").config();
const jwt = require('jsonwebtoken'); // Faltaba importar el módulo jwt

const { JWTKEY } = process.env;
const authMiddleware = (req, res, next) => {
    console.log("🔐 Auth middleware executing");
    const token = req.headers.authorization?.split(' ')[1] || 
                  req.cookies?.token || 
                  req.body?.token;
    
    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }
    try {
      const decoded = jwt.verify(token, JWTKEY);
      console.log(decoded)
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ message: "Invalid token", error: error.message });
    }
  };
  
  // Authorization middleware - checks user roles
  const checkRole = (allowedRoles) => {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      if (allowedRoles.includes(req.user.role) || req.user.role === 'admin') {
        next();
      } else {
        return res.status(403).json({ message: "Access denied. Insufficient permissions." });
      }
    };
  };

  module.exports = {
    checkRole,
    authMiddleware
  }