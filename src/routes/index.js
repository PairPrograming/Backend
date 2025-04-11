const { Router } = require('express');
const router = Router();
const routeRoles = require('./routeRoles');
const routeUsers = require('./routeUsers');
const routeLogin = require('./routeLogin');
const routeSalon = require('./routeSalon');
const routePunto = require('./routePunto')
//const routeService = require('./routeServices');

router.use("/api/users/role", routeRoles);
router.use("/api/users", routeUsers);
router.use("/api/auth", routeLogin);
router.use("/api/salon", routeSalon);
router.use("/api/puntodeventa", routePunto);
//router.use("/api/payment/", routeService)


module.exports = router