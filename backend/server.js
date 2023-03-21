const express = require('express')
const app = express() 
const mongoose = require('mongoose')
const cors = require('cors')
const connectToDb = require('./config/connectToDb')
const { MobileNumberCategorieModel, MobileNumberModel } = require('./model/MobileNumber')
const axios = require('axios')
require('dotenv').config()

//middlewares:
app.use(express.json())
app.use(cors())


//connecting to the dataBase
connectToDb() 


//micro service for validation of phone number using apiLayer
const validatePhoneNumber = async (phoneNumber) => {
    const apiKey = process.env.PHONE_NUMBER_API_KEY
    try {
        const response = await axios.get('https://api.apilayer.com/number_verification/validate', {    
        params: {
                number: phoneNumber
            },
            headers: {
                apiKey: apiKey
            }
        })
        return response.data
    } catch (error) {
        console.log('error validating phone number', error)
        return null
    }
}

//validation of the phone number by sending the phoneNumber to apiLayer:
app.post('/validate-phone-number', async (req, res) => {
    const phoneNumber = req.body.phoneNumber
    const isValid = await validatePhoneNumber(phoneNumber)
    if(isValid.valid) {
        const { valid, country_code, country_name, carrier } = isValid
        res.json({ valid, country_code, country_name, carrier })
    } else {
        res.status(400).json("invalid phone number")
    }
})

// add item to mongodb after receiving data from the frontEnd(name, desc, phoneNumber):
app.post('/addItem', async (req, res) => {
    const { phoneNumber, name, description, category } = req.body
    const isValid = await validatePhoneNumber(phoneNumber)
    if(isValid.valid){
            const mobileNumberCategory = new MobileNumberCategorieModel({ category: category });
            const savedCategory = await mobileNumberCategory.save();
            const categoryId = savedCategory._id
        const mobileNumber = new MobileNumberModel({
            phoneNumber:  phoneNumber, 
            countryCode: isValid.country_code, 
            countryName: isValid.country_name, 
            operatorName: isValid.carrier,
            name: name,
            description: description,
            categoryObjId: categoryId
        })
        try {
            const savedNumber = await mobileNumber.save()
            const { valid, number, country_name, country_code, carrier } = isValid
            res.json({ valid, number, country_name, country_code, carrier, _id: savedNumber._id })
        } catch (error) {   
            console.log(error);
            res.status(500).send('error with adding the phone number')
        }
    } else {
        res.status(400).send('Invalid phone number')
    }
})

//Fetch all the data from the dataBase:
app.get('/GetAllData', async (req, res) => {
    try {
        const response = await MobileNumberModel.find({})
        res.json(response)
    } catch (error) {
        console.log(error)
    }
})

//delete entire item byId:
app.delete('/deleteItem/:id', async (req, res) => {
    const { id } = req.params 
    try {
        const response = await MobileNumberModel.findByIdAndDelete(id)
        if(response === null) {
            res.status(400).send('mobile number not found')
        } else {
            res.status(200).send('mobile number deleted successfully')
        }
    } catch(error) {
        console.log(error)
        res.status(500).send('internal server error')
    }
})

// update Item name byId:
app.put('/updateItem/:id', async(req, res) => {
    const { id } = req.params
    const { newName } = req.body
    try {
        const response = await MobileNumberModel.findByIdAndUpdate(id, { name: newName })
        res.status(200).send('the name of the item is updated :)')
    } catch(error) {
        console.log(error)
        res.status.send('internal server error')
    }
})

//the server is set up to listen on a specific porst(port Stored in the .env)
app.listen(process.env.PORT, () => {
    console.log(`server listenning on port 5000`)
})





