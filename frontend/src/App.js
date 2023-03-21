import React, { useState, useEffect } from 'react';
import axios from 'axios'
import './App.css'

const App = () => {
  
  //use 'useState' hook to store all the data related to the phone number
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [isValidPhoneNumber, setIsValidPhoneNumber] = useState(false);
  const [listOfNumbers, setListOfNumbers] = useState([])
  const [category, setCategory] = useState('')

  /*
  -function that sends the phone number to the backend to be sent to third party api
  and check if the number is valid or not 
  -Input: phoneNumber (string)
  -Output: JSON object with the following properties: valid, number, country_name, country_code, operatorname
  */
  const validatePhoneNumber = async () => {
    if(!phoneNumber) {
      alert('phone Number is required!!')
      return
    }
    try {
      const response = await axios.post('http://localhost:5000/validate-phone-number', {
        phoneNumber: phoneNumber
      })
      const data = response.data
      if(data.valid) {
        setIsValidPhoneNumber(true)
        alert(`phone number is valid 
countryCode:  ${data.country_code}
countryName:  ${data.country_name} 
operatorName:  ${data.carrier}`)
      } else {
        setIsValidPhoneNumber(false)
        alert('phone number is invalid')
      }
    } catch (error) {
      console.log(error);
      alert('alert validation phone number')
    }
  }
  
  /*function that send the name the description and the phoneNum to the backend to check the number
  and if the number is valid the inf will be stored in the database
  input: json contains (name, des, phoneNumber)
  output: string of success of failur adding item
  */
  const addItem = async () => {
    if(!phoneNumber || !name || !description || !category) {
      alert('missing fields !!!!!')
      return 
    }
    try {
      const response = await axios.post("http://localhost:5000/addItem", {
        phoneNumber, name, description, category
      })
      const data = response.data
      if(data.valid) {
        setListOfNumbers([
          ...listOfNumbers,
          {
          _id: data._id, 
          phoneNumber: data.number,
          name: name, 
          description: description,
          countryCode: data.country_code,
          countryName: data.country_name,
          operatorName: data.carrier
        }])
        alert('Item added to db :)')
      }
      else {
        alert('phone number is not valid!!!')
      }
    } catch (error) {
      console.log(error);
      alert('error adding item')
    }
    setName("")
    setDescription("")
    setPhoneNumber("")
    setCategory("")
  }

  //useEffect hook is used to fetch all inf related to the phone from the database (when the page refreshes)
  useEffect(() => {
    const getAllData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/GetAllData')
        console.log(response)
        console.log(response.data)
        setListOfNumbers(response.data)
      } catch(error) {
        console.log(error)
      }
    }
    getAllData()
  }, [])

  /*
  delete item from the database By the Id of the phone number that will be send when the user Click on delete.
  input: req to db with item Id
  output: string of failor or success of deleting
  */
  const deleteItem = async (id) => {
    try {
      const response = await axios.delete(`http://localhost:5000/deleteItem/${id}`)
      const data = response.data
      alert(data)
      setListOfNumbers(listOfNumbers.filter((number) => (
          number._id !== id
      )))
    } catch (error) {
      console.log(error);
    }
  }

  /*update name, the user provide the NewName that will be sent to the backend that updates the name
  of the item by its id that is being passed by the request as params.
  input: newName
  output: upated item
  */ 
  const updateItem = async (id) => {
    const newName = prompt('Enter the new name!!') 
    try {
      const response = await axios.put(`http://localhost:5000/updateItem/${id}`, { newName: newName })
      const data = response.data
      alert(data)
      setListOfNumbers(listOfNumbers.map((number) => {
        return number._id === id ? {...number , name: newName} : number
      }))
    } catch(error) {
      console.log(error);
    }
  }

  return (
    //first section of the frontend where the user can check the validation of the phone number and
    //add an item(name, phoneNum, description) to the db.
    <div className='App'>
      <div className='phoneValidate'>
      <div>
        <label htmlFor="phoneNumber">Enter a Phone Number</label>
          <input 
          type="text"
          id="phoneNumber"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          />
      </div>
      <div>
        <label htmlFor="phoneNumber">name</label>
          <input 
          type="text"
          id="phoneNumber"
          value={name}
          onChange={(e) => setName(e.target.value)}
          />
          </div>
          <div>
        <label htmlFor="description">Description</label>
          <input 
          type="text"
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          />
          </div>
          <div>
          <label htmlFor="category">Category</label>
            <input 
            type="text"
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            />
            </div>
          <div>
          <button onClick={validatePhoneNumber} className='submit-phoneNumber'>Validate</button>
          <button onClick={addItem} className='addItem'>Add Item</button>
          </div>
      </div>
      <div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Phone Number</th>
              <th>Name</th>
              <th>Description</th>
              <th>CountryCode</th>
              <th>CountryName</th>
              <th>operatorName</th>
              <th>update</th>
              <th>delete</th>
            </tr>
          </thead>
          <tbody>
            {listOfNumbers.map((number) => {
              return <tr key={number._id}>
                <td>{number.phoneNumber}</td>
                <td>{number.name}</td>
                <td>{number.description}</td>
                <td>{number.countryName}</td>
                <td>{number.countryCode}</td>
                <td>{number.operatorName}</td>
                <td><button className='updateBut' onClick={() => updateItem(number._id)}>update</button></td>
                <td><button className="deleteBut" onClick={() => deleteItem(number._id)}>delete</button></td>
              </tr>
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default App;


