const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://theo:${password}@phonebook.rcj83.mongodb.net/people?retryWrites=true&w=majority&appName=phonebook`

mongoose.set('strictQuery', false)

mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String
})

const Person = mongoose.model('Person', personSchema)

if (process.argv.length === 3) {
  Person.find({}).then(result => {
    result.forEach(person => {
      console.log(person)
    })
    mongoose.connection.close()
  })
}

if (process.argv.length === 5) {
  const name = process.argv[3]
  const number = process.argv[4]

  const newPerson = new Person({
    name: name,
    number: number
  })

  newPerson.save().then(result => {
    console.log(`${name} saved`, result)
    mongoose.connection.close()
  })
}

