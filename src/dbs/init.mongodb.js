'use strict';

const mongoose = require('mongoose');

const { db: { host, port, name } } = require('../configs/config.mongodb')

const connectString = `mongodb://${host}:${port}/${name}`;
const { countConnect } = require('../helpers/check.connect')

console.log(connectString)

class Database {

    constructor() {
        this.connect()
    }

    //connect
    connect(type = "mongodb") {

        if (1 === 1) {
            mongoose.set('debug', true);
            mongoose.set('debug', { color: true });
        }

        mongoose
            .connect(connectString, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            })
            .then(() => {
                console.log('Connected to MongoDB', countConnect());
            })
            .catch((error) => {
                console.error('Error connecting to MongoDB', error);
            });

    }

    static getInstance() {
        if (!Database.instance) {
            Database.instance = new Database()
        }

        return Database.instance
    }

}

const instanceMongoodb = Database.getInstance()

module.exports = instanceMongoodb