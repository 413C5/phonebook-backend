const mongoose = require('mongoose')

if (process.argv.length < 3) {
    console.log('Please provide password as an argument')
    process.exit(1)
}

//1    2        3            4    5
//node mongo.js yourpassword Anna 040-1234556
const password = process.argv[2]
const name = process.argv[3]
const number = process.argv[4]

const url = `mongodb+srv://fullstack:${password}@cluster0.ezwn4oa.mongodb.net/app-phonebook?retryWrites=true&w=majority`

mongoose.set('strictQuery', false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
    name: String,
    number: String,
})

const Person = mongoose.model('Person', personSchema)

//Check database
if (process.argv.length < 4) {
    /* console.log('check database')
    console.log(process.argv.length) */


    Person.find().then(result => {
        console.log('Phonebook:')
        result.forEach(person => {
            console.log(person.name,' ',person.number)
        })
        mongoose.connection.close()
    })
}

//Add persons
else if (process.argv.length > 4 && process.argv.length < 6) {
    /* console.log('add person')
    console.log(process.argv.length) */

    const person = new Person({
        name: name,
        number: number,
    })

    person.save().then(result => {
        console.log(`added ${person.name} number ${person.number} to phonebook`)
        //console.log(result)
        mongoose.connection.close()
    })
}

else {
    console.log(`Provided more arguments than neccesary`)
    mongoose.connection.close()
}


