//Imports
const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const morgan = require('morgan')
//app.use(morgan('tiny'))

//Models used
const Person = require('./models/person')

//Middleware
morgan.token('object', function (request, require) {
    return `${JSON.stringify(request.body)}`
})

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    }

    next(error)
}

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

//Middleware configuration
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :object'))
app.use(cors())
app.use(express.json())
app.use(express.static('build'))

app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
})

//Get all persons
app.get('/api/persons', (request, response, next) => {
    Person.find({})
        .then(persons => {
            response.json(persons)
        })
        .catch(error => {
            next(error)
        })
})

//Get number of people in phonebook + date of query
app.get('/info', (request, response, next) => {
    const date = new Date()
    const today = date.toDateString()
    const time = date.toTimeString()

    Person.countDocuments({})
        .then(count => {
            response.send(
                `Phonebook has info for ${count} people` +
                `</br> </br>${today} ${time}`)
        })
        .catch(error => {
            next(error)
        })
})

//Search by id
app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
        .then(person => {
            response.json(person)
        })
        //CastError
        .catch(error => {
            next(error)
        })
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndRemove(request.params.id)
        .then(result => {
            if (result !== null)
                response.status(204).end()
            else
                response.status(404).end()
        })
        //CastError
        .catch(error => {
            next(error)
        })
})

//Add new person to phonebook
app.post('/api/persons', (request, response) => {
    const body = request.body

    //Name or number is missing
    if (!body.name && !body.number) {
        return response.status(400).json({
            error: 'name or number is missing'
        })
    }

    else if (!body.name) {
        return response.status(400).json({
            error: 'name is missing'
        })
    }

    else if (!body.number) {
        return response.status(400).json({
            error: 'number is missing'
        })
    }

    else {

        const newPerson = Person({
            name: body.name,
            number: body.number
        })

        newPerson.save({})
            .then(savedPerson => {
                response.json(savedPerson)
            })
    }
})

app.put('/api/persons/:id', (request, response, next) => {
    const id = Number(request.params.id)
    const body = request.body

    const findPerson = persons.find(person => person.id === id)

    console.log('Find person', findPerson)
    console.log('---------------before update')

    if (findPerson !== undefined) {
        const updatedPerson = {
            id: id,
            name: findPerson.name,
            number: body.number
        }

        persons = persons.map(x => {
            if (x.id === id)
                return (
                    x = updatedPerson
                )
            else
                return x
        })
        console.log('---------------after update')
        console.log('id', id)
        console.log('body', body)
        console.log('updatedPerson', updatedPerson)
        response.json(updatedPerson)
        console.log('persons', persons)
    }
    else {
        response.status(400).json({
            error: 'person with id not found'
        })
    }
})

//Error handler middleware
app.use(errorHandler)
app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})