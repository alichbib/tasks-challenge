const mongoose = require('mongoose')

const connectToDb = () => {
    mongoose.connect(process.env.MONGOOSE_URL, {
        useNewUrlParser: true
    })
    console.log("Connected to db :)");
}

module.exports = connectToDb