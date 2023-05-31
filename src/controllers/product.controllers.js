
const { CREATED, SuccessResponse } = require("../core/success.response")
const ProductService = require("../services/product.service")



class ProductControllers {

    createProduct = async (req, res, next) => {

        new SuccessResponse({
            message: 'create new product success',
            metadata: await ProductService.createProduct(req.body.product_type, {
                ...req.body,
                product_shop: req.keyStore.user
            })
        }).send(res)
    }

}

module.exports = new ProductControllers()