require("dotenv").config();
const jwt = require('jsonwebtoken');
const jwksRsa = require("jwks-rsa");
const User = require('../models/Users');

const JWTKEY = process.env.JWTKEY;
const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN;
const AUTH0_AUDIENCE = process.env.AUTH0_AUDIENCE;

const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || 
                req.cookies?.token || 
                req.body?.token;
  
  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    try {
      const decoded = jwt.verify(token, JWTKEY);
      req.user = decoded;
      return next();
    } catch (jwtError) {
      console.log("No es un JWT estándar, intentando con Auth0...");
    }
    try {
      const auth0Verifier = jwksRsa({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `https://${AUTH0_DOMAIN}/.well-known/jwks.json`
      });
      
      const decodedToken = jwt.decode(token, { complete: true });
      if (!decodedToken) {
        throw new Error("Invalid token format");
      }
      
      const kid = decodedToken.header.kid;
      const key = await auth0Verifier.getSigningKey(kid);
      const signingKey = key.getPublicKey();
      
      // Verificar el token con la clave pública
      const verified = jwt.verify(token, signingKey, {
        audience: AUTH0_AUDIENCE,
        issuer: `https://${AUTH0_DOMAIN}/`,
        algorithms: ["RS256"]
      });
      
      // Buscar usuario en la base de datos usando el Auth0 ID
      const user = await User.findOne({ auth0Id: verified.sub });
      
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }
      
      // Establecer la información del usuario
      req.user = {
        id: user._id,
        auth0Id: verified.sub,
        role: user.role,
        email: user.email
      };
      
      next();
    } catch (auth0Error) {
      console.error("Error de autenticación Auth0:", auth0Error);
      return res.status(401).json({ message: "Token inválido" });
    }
  } catch (error) {
    console.error("Error de autenticación:", error);
    return res.status(401).json({ message: "Invalid token", error: error.message });
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