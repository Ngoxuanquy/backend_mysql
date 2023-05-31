
const keytokenModel = require("../models/keytoken.model")
const { Types } = require('mongoose')

class KeyTokenServices {
    static createKeyToken = async ({ userId, publicKey, privateKey, refeshToken }) => {
        try {
            // const tokens = await keytokenModel.create({
            //     user: userId,
            //     publicKey,
            //     privateKey,
            // })

            // return tokens ? tokens.publicKey : null

            const filter = { user: userId },
                update = {
                    publicKey,
                    privateKey,
                    refeshTokensUsed: [],
                    refeshToken,
                },
                options = { upsert: true, new: true }

            const tokens = await keytokenModel.findOneAndUpdate(filter, update, options)

            return tokens ? tokens.publicKey : null

        } catch (error) {
            return error
        }
    }

    static findByUserId = async (userId) => {
        const keyToken = await keytokenModel.findOne({ user: new Types.ObjectId(userId) })
        if (!keyToken) return console.log('loi')

        return await keyToken
    }

    static removeKeyById = async (id) => {
        console.log("id: " + id)
        return keytokenModel.deleteOne({ _id: id })
    }

    static findByRefreshTokenUsed = async (refeshToken) => {

        console.log('1232')

        return await keytokenModel.findOne({ refeshTokensUsed: refeshToken })
    }

    static findByRefreshToken = async (refeshToken) => {


        return await keytokenModel.findOne({ refeshToken })
    }

    static deleteKeyById = async (userId) => {
        return await keytokenModel.deleteOne({ user: new Types.ObjectId(userId) })
    }
}


module.exports = KeyTokenServices