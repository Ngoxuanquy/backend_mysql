
const express = require('express');
const asyncHandler = require('../../helpers/asyncHandle');
const AccessControllers = require('../../controllers/access.controllers')
const { authentication, authenticationV2 } = require('../../auth/authUtils')

const router = express.Router();


//signup

router.post('/shop/signup', asyncHandler(AccessControllers.signUp))
router.post('/shop/login', asyncHandler(AccessControllers.login))


// authentication

router.use(authenticationV2)

router.post('/shop/logout', asyncHandler(AccessControllers.logout))
router.post('/shop/handlerRefreshToken', asyncHandler(AccessControllers.handlerRefreshToken))


module.exports = router