const express = require('express')
const morgan = require('morgan')
const app = express()

app.use(express.static('dist'))

app.use(express.json())


let persons = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

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
    response.json(persons)
})

app.get('/info', (request, response) => {
    response.send(`
        <p>Phonebook has info for ${persons.length} people</p>
        <p>${(new Date()).toString()}</p>
    `)
})

app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id
    const person = persons.find(p => p.id === id)

    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
})

app.post('/api/persons/', (request, response) => {
    let id = Math.floor(Math.random() * 1000)
    while(persons.find(person => person.id === id)) {
        id = Math.floor(Math.random() * 1000)
    }
    const person = request.body
    person.id = String(id)

    if (!person.name || !person.number) {
        return response.status(400).json({ 
            error: 'Name or number is missing' 
        })
    } 
    if (persons.find(p => p.name === person.name)) {
        return response.status(400).json({ 
            error: 'Name already exists in the phonebook' 
        })
    }

    persons = persons.concat(person)
    response.json(person)
})

app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id
    persons = persons.filter(person => person.id !== id)

    response.status(204).end()
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const PORT = process.env.PORT || 3003
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
