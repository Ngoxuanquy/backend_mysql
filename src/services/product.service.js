

const { product, clothing, electronic } = require('../models/product.model')
const { BadRequestError, AuthFailureError, ForbiddenError } = require("../core/error.response.js")

// define Factory class to create product
class ProductFactory {
    static async createProduct(type, payload) {

        switch (type) {
            case 'Electronics':
                return new Electronics(payload).createProduct()
            case 'Clothing':
                return new Clothing(payload).createProduct()
            default:
                throw new BadRequestError(`Invalid Product Types ${type}`)

        }
    }

}

// define base product class
class Product {
    constructor({
        product_name, product_thumb, product_description, product_price,
        product_type, product_shop, product_attributes, product_quantity
    }) {

        this.product_attributes = product_attributes
        this.product_quantity = product_quantity
        this.product_name = product_name
        this.product_thumb = product_thumb
        this.product_description = product_description
        this.product_price = product_price
        this.product_type = product_type
        this.product_shop = product_shop

    }

    // create new product
    async createProduct(product_id) {
        console.log(product_id)
        return await product.create({ ...this, _id: product_id })
    }

}

// Define sub-class for different product types Clothing
class Clothing extends Product {
    async createProduct() {

        const newClothing = await clothing.create({
            ...this.product_attributes,
            product_shop: this.product_shop
        })
        if (!newClothing) throw new BadRequestError('create new Clothing error')

        const newProduct = await super.createProduct(newElectronic._id)
        if (!newProduct) throw new BadRequestError('create new Product error')

        return newProduct
    }
}

// Define sub-class for different product types electronics
class Electronics extends Product {
    async createProduct() {

        const newElectronic = await electronic.create({
            ...this.product_attributes,
            product_shop: this.product_shop
        })

        console.log(newElectronic)

        if (!newElectronic) throw new BadRequestError('create new Clothing error')


        const newProduct = await super.createProduct(newElectronic._id)
        if (!newProduct) throw new BadRequestError('create new Product error')

        return newProduct
    }
}

module.exports = ProductFactory