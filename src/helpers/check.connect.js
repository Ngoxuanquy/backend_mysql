const mongoose = require('mongoose')
const os = require('os')
const process = require('process')

const _SECONDS = 5000;
// đếm số lượng kết nối vào db

const countConnect = () => {
    const numConnect = mongoose.connections.length

    console.log(`Number of connection ${numConnect}`)
}

// check sever quá tải
const checkOverLoad = () => {
    setInterval(() => {
        const numConnect = mongoose.connections.length
        const numCores = os.cpus().length;
        const menoryUsage = process.memoryUsage().rss;
        const maxConect = numCores * 5;

        // console.log(menoryUsage / 1024 / 1024)

        // console.log('active connections ' + numConnect)

        if (numConnect > maxConect) {
            console.log('Quá tải')
        }

    }, _SECONDS)
}

module.exports = {
    countConnect,
    checkOverLoad
}