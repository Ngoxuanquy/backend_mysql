
const shopModel = require("../models/shop.model")
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const KeyTokenServices = require("./KeyToken.services")
const { createTokenPair, verifyJWT } = require("../auth/authUtils")
const getIntoData = require("../utils")
const { BadRequestError, AuthFailureError, ForbiddenError } = require("../core/error.response.js")
const { findByEmail } = require('./shop.service')


const RoleShop = {
    SHOP: 'SHOP',
    WRITE: 'WRITE',
    EDITOR: 'EDITOR',
    ADMIN: 'ADMIN'
}


class AccessSevice {

    static HandlerRefreshTokenV2 = async ({ keyStore, user, refeshToken }) => {

        console.log("a23")



        const { userId, email } = user;

        if (keyStore.refeshTokensUsed.includes(refeshToken)) {
            await KeyTokenServices.deleteKeyById(userId)
            throw new ForbiddenError('Something  wrng happend')

        }

        console.log(keyStore.refeshToken === refeshToken)

        if (keyStore.refeshToken != refeshToken) throw new AuthFailureError('Shop not reqisteted 1')

        const foundShop = await findByEmail({ email })
        if (!foundShop) throw new AuthFailureError('Shop not reqisteted 2')

        //create 1 cap moiw

        const tokens = await createTokenPair(
            { userId, email },
            keyStore.publicKey,
            keyStore.privateKey
        )
        // console.log("tokens" + tokens)
        //update token
        await keyStore.updateOne({
            $set: {
                refeshToken: tokens.refeshToken
            },
            $addToSet: {
                refeshTokensUsed: refeshToken
            }
        })

        return {
            user,
            tokens
        }


    }

    static HandlerRefreshToken = async (refeshToken) => {

        //check xem token ddc su dung chuwa?
        const foundToken = await KeyTokenServices.findByRefreshTokenUsed(refeshToken)


        if (foundToken) {
            // da dung token (nguy hiem)
            const { userId, email } = await verifyJWT(refeshToken, foundToken.privateKey)
            console.log({ userId, email })

            //xoa
            await KeyTokenServices.deleteKeyById(userId)

            throw new ForbiddenError('Something  wrng happend')

        }

        // console.log("holderToken :")

        const holderToken = await KeyTokenServices.findByRefreshToken(refeshToken)

        if (!holderToken) throw new AuthFailureError('Shop not reqisteted 1')

        //verfly token
        const { userId, email } = await verifyJWT(refeshToken, holderToken.privateKey)
        //ckeck token
        // console.log('[2]' + { userId, email })

        const foundShop = await findByEmail({ email })
        if (!foundShop) throw new AuthFailureError('Shop not reqisteted 2')

        //create 1 cap moiw

        const tokens = await createTokenPair(
            { userId, email },
            holderToken.publicKey,
            holderToken.privateKey
        )
        // console.log("tokens" + tokens)
        //update token
        await holderToken.updateOne({
            $set: {
                refeshToken: tokens.refeshToken
            },
            $addToSet: {
                refeshTokensUsed: refeshToken
            }
        })

        return {
            user: { userId, email },
            tokens
        }

    }

    static logout = async (keyStore) => {
        const delKey = await KeyTokenServices.removeKeyById((keyStore._id).toString())
        return delKey
    }

    static login = async ({ email, password, refeshToken = null }) => {

        const foundShop = await findByEmail({ email })

        if (!foundShop) throw new BadRequestError('Shop not registered')

        const match = bcrypt.compare(password, foundShop.password)

        if (!match) throw new AuthFailureError('Authentication error')

        // create publicKey, privateKey

        const privateKey = crypto.randomBytes(64).toString('hex')
        const publicKey = crypto.randomBytes(64).toString('hex')

        // create token

        const tokens = await createTokenPair(
            { userId: foundShop._id, email },
            publicKey,
            privateKey
        )

        await KeyTokenServices.createKeyToken({
            userId: foundShop._id,
            refeshToken: tokens.refeshToken,
            publicKey,
            privateKey,
        })

        return {
            shop: getIntoData({ fileds: ['_id', 'name', 'email'], object: foundShop }),
            tokens,
        }
    }

    static signUp = async ({ name, email, password }) => {

        // try {
        const hodelShop = await shopModel.findOne({ email }).lean()
        if (hodelShop) {
            throw new BadRequestError('Error: Shop dax dduoc ddang ky')
        }

        const passwordHash = await bcrypt.hash(password, 10)
        const newShop = await shopModel.create({
            name, email, password: passwordHash, roles: [RoleShop.SHOP]
        })

        if (newShop) {
            // const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
            //     modulusLength: 4096,
            //     publicKeyEncoding: {
            //         type: 'pkcs1',
            //         format: 'pem'
            //     },
            //     privateKeyEncoding: {
            //         type: 'pkcs1',
            //         format: 'pem'
            //     }
            // })

            const privateKey = crypto.randomBytes(64).toString('hex')
            const publicKey = crypto.randomBytes(64).toString('hex')

            console.log({
                privateKey, publicKey
            })

            const keyStore = await KeyTokenServices.createKeyToken({
                userId: newShop._id,
                publicKey,
                privateKey
            })

            if (!keyStore) {
                return {
                    code: 403,
                    message: 'keyStore errr'
                }
            }

            // const publicKeyObject = crypto.createPublicKey(publicKeyString)

            // console.log("publicKeyObject : ", publicKeyObject)

            //create token pair
            const tokens = await createTokenPair({ userId: newShop._id, email }, publicKey, privateKey)

            console.log('create token: ' + tokens)

            return {
                code: 201,
                metadata: {
                    shop: getIntoData({ fileds: ['_id', 'name', 'email'], object: newShop }),
                    tokens
                }
            }
        }

        return {
            code: 200,
            metadata: null
        }

        // } catch (error) {
        //     return {
        //         code: 'xxx',
        //         message: error.message,
        //         status: 'error'

        //     }
        // }
    }
}

module.exports = AccessSevice
