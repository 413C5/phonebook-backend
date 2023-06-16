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
    else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }
    next(error)
}

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

const catchAllErrorHandler = (error, request, response, next) => {
    console.error('Unhandled error:', error)
    console.log(error.name)
    response.status(500).json({ error: 'Internal server error' });
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
//It works
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
//It works
app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
        .then(person => {
            if (person !== null)
                response.json(person)
            else
                response.status(404).end()
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
app.post('/api/persons', (request, response, next) => {
    const body = request.body
    const findPerson = Person.findOne({ name: body.name })

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
        findPerson
            .then(result => {
                if (result !== null) {
                    return response.status(400).json({
                        error: 'name must be unique'
                    })
                }
                const newPerson = Person({
                    name: body.name,
                    number: body.number
                })

                newPerson.save({})
                    .then(savedPerson => {
                        response.json(savedPerson)
                    })
                    .catch(error => {
                        next(error)
                    })
            })
            .catch(error => {
                next(error)
            })
    }
})

app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body
    const personUpdate = {
        name: body.name,
        number: body.number
    }

    Person.findByIdAndUpdate(request.params.id, personUpdate, { new: true, runValidators: true, context: 'query' })
        .then(updatedPerson => {
            if (updatedPerson) {
                response.json(updatedPerson);
            }
            else {
                response.status(404).send();
            }
        })
        .catch(error => {
            next(error)
        })
})

//Error handler middleware
app.use(errorHandler)
app.use(unknownEndpoint)
app.use(catchAllErrorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})