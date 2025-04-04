const { Router } = require('express');
const { createUsserHandler, obtenerUserHandler, 
    obtenerUserGridHandler, updateUserHandler,
    changePasswordHandler
} = require('../Handlers/UserHandler');


const routeUsers = Router();
routeUsers.post('/register', createUsserHandler);
routeUsers.get('/perfil/:id', obtenerUserHandler);
routeUsers.get('/grid', obtenerUserGridHandler);
routeUsers.put('/perfil/:id', updateUserHandler);
routeUsers.put('/changepasword/:id', changePasswordHandler);
module.exports = routeUsers;