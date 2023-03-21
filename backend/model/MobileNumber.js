const mongoose = require('mongoose')

const MobileNumberSchema = new mongoose.Schema({
    phoneNumber:  String, 
    countryCode: String, 
    countryName: String, 
    operatorName:String,
    name: String,
    description: String,
    categoryObjId: {
        type: mongoose.Schema.Types.ObjectId, ref: 'mobileNumberCategorie'
    }
})

const MobileNumberCategorie = new mongoose.Schema({
    category: {
        type: String
    }
})

const MobileNumberModel = mongoose.model('mobileNumber', MobileNumberSchema)
const MobileNumberCategorieModel = mongoose.model('mobileNumberCategorie', MobileNumberCategorie)
module.exports = { MobileNumberModel, MobileNumberCategorieModel }