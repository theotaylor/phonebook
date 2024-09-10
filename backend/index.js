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

app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
})

app.get('/info', async (request, response) => {
    // Count the number of documents in the Person collection
    const count = await Person.countDocuments({});
    response.send(`
        <p>Phonebook has info for ${count} people</p>
        <p>${(new Date()).toString()}</p>
    `)
})

app.get('/api/persons/:id', async (request, response) => {
    const id = request.params.id

    // Check if the id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return response.status(400).send({ error: 'Invalid ID format' })
    }

    try {
        const person = await Person.findById(id)

        if (person) {
            response.json(person)
        } else {
            response.status(404).end()
        }
    } catch (error) {
        console.error('Error fetching person by ID:', error)
        response.status(400).send({ error: 'malformatted id' })
    }
})

app.post('/api/persons/', (request, response) => {
    const body = request.body

    if (!body.name || !body.number) {
        return response.status(400).json({
            error: 'Name or number is missing'
        })
    }

    Person.findOne({ name: body.name })
        .then(existingPerson => {
            if (existingPerson) {
                return response.status(400).json({ 
                    error: 'Name already exists in the phonebook' 
                })
            }

            const person = new Person({
                name: body.name,
                number: body.number,
            })

            return person.save()
        })
        .then(savedPerson => {
            response.json(savedPerson)
        })
        .catch(error => {
            console.error('Error saving person:', error)
            response.status(500).json({ error: 'Internal Server Error' })
        })
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



// app.get('/api/persons', (request, response) => {
//     response.json(persons)
// })
// app.get('/info', (request, response) => {
//     response.send(`
//         <p>Phonebook has info for ${persons.length} people</p>
//         <p>${(new Date()).toString()}</p>
//     `)
// })
// app.get('/api/persons/:id', (request, response) => {
//     const id = request.params.id
//     const person = persons.find(p => p.id === id)

//     if (person) {
//         response.json(person)
//     } else {
//         response.status(404).end()
//     }
// })

// app.post('/api/persons/', (request, response) => {
//     let id = Math.floor(Math.random() * 1000)
//     while(persons.find(person => person.id === id)) {
//         id = Math.floor(Math.random() * 1000)
//     }
//     const person = request.body
//     person.id = String(id)

//     if (!person.name || !person.number) {
//         return response.status(400).json({ 
//             error: 'Name or number is missing' 
//         })
//     } 
//     if (persons.find(p => p.name === person.name)) {
//         return response.status(400).json({ 
//             error: 'Name already exists in the phonebook' 
//         })
//     }

//     persons = persons.concat(person)
//     response.json(person)
// })
// app.delete('/api/persons/:id', (request, response) => {
//     const id = request.params.id
//     persons = persons.filter(person => person.id !== id)

//     response.status(204).end()
// })