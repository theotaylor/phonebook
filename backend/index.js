require('dotenv').config()

const express = require('express')
const morgan = require('morgan')
const mongoose = require('mongoose')

const app = express()

app.use(express.static('dist'))

app.use(express.json())

const Person = require('./models/person')

const cors = require('cors')
app.use(cors())


morgan.token('post-body', function (request, response) {
    if (request.method === 'POST') {
        const {name, number} = request.body
        return JSON.stringify({name, number})
    }
    return ''
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :post-body'))

// app.get('/', (request, response) => {
//     response.send('Welcome to the Phonebook API')
// })

app.get('/api/persons', (request, response, next) => {
    Person.find({})
        .then(persons => {
            response.json(persons)
        })
        .catch(error => next(error))
})

app.get('/info', (request, response, next) => {
    // Count the number of documents in the Person collection
    Person.countDocuments({})
        .then(count => {
            response.send(`
                <p>Phonebook has info for ${count} people</p>
                <p>${(new Date()).toString()}</p>
            `)
        })
        .catch(error => next(error))
})


app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
        .then(person => {
            if (person) {
                response.json(person)
            } else {
                response.status(404).end()
            }
        })
        .catch(error => next(error))
})

app.post('/api/persons/', (request, response, next) => {
    const body = request.body

    if (!body.name || !body.number) {
        return response.status(400).json({
            error: 'Name or number is missing'
        })
    }

    const person = new Person({
        name: body.name,
        number: body.number,
    })

    person.save().then(savedPerson => {
        response.json(savedPerson)
    })
    .catch(error => next(error))

    // Person.findOne({ name: body.name })
    //     .then(existingPerson => {
    //         if (existingPerson) {
    //             return response.status(400).json({ 
    //                 error: 'Name already exists in the phonebook' 
    //             })
    //         }

    //         const person = new Person({
    //             name: body.name,
    //             number: body.number,
    //         })

    //         return person.save()
    //     })
    //     .then(savedPerson => {
    //         response.json(savedPerson)
    //     })
    //     .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body

    const person = {
        name: body.name,
        number: body.number,
    }

    Person.findByIdAndUpdate(request.params.id, person, { new: true })
        .then(updatedPerson => {
            response.json(updatedPerson)
        })
        .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndDelete(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
}) 

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.error(error.stack)

    response.status(500).send({ error: 'Something went wrong' })

    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
