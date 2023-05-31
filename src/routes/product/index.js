
const express = require('express');
const asyncHandler = require('../../helpers/asyncHandle');
const ProductControllers = require('../../controllers/product.controllers')
const { authentication, authenticationV2 } = require('../../auth/authUtils')

const router = express.Router();


// authentication

router.use(authenticationV2)

router.post('', asyncHandler(ProductControllers.createProduct))


module.exports = router