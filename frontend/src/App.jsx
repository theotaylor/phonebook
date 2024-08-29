import { useState, useEffect } from 'react'
import personsService from '../services/persons'

const App = () => {
  const [persons, setPersons] = useState([]) 
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [newSearch, setSearch] = useState('')
  const [addPersonMessage, setAddedPersonMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [idCounter, setIdCounter] = useState(3)

  useEffect(() => {
    personsService
      .getAll()
      .then(initialPersons => {
        setPersons(initialPersons)
      })
  }, [])

  const handleSearch = (event) => {
    setSearch(event.target.value)
  }

  const handleNameAdd = (event) => {
    setNewName(event.target.value)
  }

  const handleNumberAdd = (event) => {
    setNewNumber(event.target.value)
  }

  const deletePerson = (id) => {
    const person = persons.find(person => person.id === id)
    if (window.confirm(`Delete ${person.name} ?`)) {
      personsService
        .deletion(id)
        .then(() => {
          const newPersons = persons.filter(person => person.id !== id)
          setPersons(newPersons)
          console.log("deletion successful")
        })
    }
  }

  const updatePerson = () => {
    if (window.confirm(`${newName} is already added to phonebook, replace the old number with a new one?`)) {
      const existingPerson = persons.find(person => person.name === newName)

      const newPerson = {
        name: newName, 
        number: newNumber,
        id: existingPerson.id,
      }
            
      personsService
        .update(existingPerson.id, newPerson)
        .then(returnedPerson => {
          setPersons(persons.map(person => person.id === returnedPerson.id ? returnedPerson : person))
          setNewName('')
          setNewNumber('')
        })
        .catch(error => {
          setErrorMessage(`${newPerson.name} has already been deleted`)
          setTimeout(() => {
            setErrorMessage(null)
          }, 5000)
        })
    } 
  }

  const addPerson = (event) => {
    event.preventDefault()

    const isPersonAlreadyExisting = persons.some(person => person.name === newName)
    if (isPersonAlreadyExisting) {
      updatePerson()
    } else {
      const newPerson = {
        name: newName, 
        number: newNumber,
        id: String(idCounter),
      }
      setIdCounter(idCounter + 1)
  
      personsService
        .create(newPerson)
        .then(returnedPersons => {
          setPersons(persons.concat(returnedPersons))
          setNewName('')
          setNewNumber('')
        })
      setAddedPersonMessage(`Added ${newPerson.name}`)
      setTimeout(() => {
        setAddedPersonMessage(null)
      }, 2000)
    }
  }

  const filteredPersons = persons.filter(persons => 
    persons.name.toLowerCase().includes(newSearch.toLowerCase())
  )

  return (
    <div>
      <h2>Phonebook</h2>
      <AddNotification message={addPersonMessage}/>
      <ErrorNotification message={errorMessage}/>
      filter shown with <Search newSearch={newSearch} handleSearch={handleSearch}/>  
      <h3>add a new</h3>
      <PersonForm 
        newName={newName}
        newNumber={newNumber}
        addPerson={addPerson}
        handleNameAdd={handleNameAdd}
        handleNumberAdd={handleNumberAdd}
      />
      <h3>Numbers</h3>
      <Persons persons={filteredPersons} deletePerson={deletePerson}/>
    </div>
  )
}

const Search = ({newSearch, handleSearch}) => <input value={newSearch} onChange={handleSearch}/>

const PersonForm = ({newName, newNumber, addPerson, handleNameAdd, handleNumberAdd}) => {

  return (
    <form onSubmit={addPerson}>
      <div>
        name:<input value={newName} onChange={handleNameAdd}/>
      </div>
      <div>
        number:<input value={newNumber} onChange={handleNumberAdd} />
      </div>
      <div>
        <button type="submit">add</button>
      </div>
    </form>
  )
}

const Persons = ({persons, deletePerson}) => {
  return (
    persons.map(person => <Person key={person.id} name={person.name} number={person.number} id={person.id} deletePerson={deletePerson}/>)
  )
}

const Person = ({name, number, id, deletePerson}) => {
  return (
    <p>
      {name} {number} <button onClick={() => deletePerson(id)}>delete</button>
    </p>
  )
}

const AddNotification = ({message}) => {
  if (!message) {
    return null
  } else {
    const notifStyle = {
      border: '2px solid green',
      backgroundColor: 'rgb(203 203 203)',
      color: 'green',
      padding: '0 0 0 20px',
      borderRadius: '8px',
      marginBottom: '10px',
    }
    return (
        <div className="notif" style={notifStyle}>
          <h3>{message}</h3>
        </div>
      )
  }
}

const ErrorNotification = ({message}) => {
  if (!message) {
    return null
  } else {
    const errorStyling = {
      border: '2px solid red',
      backgroundColor: 'rgb(203 203 203)',
      color: 'green',
      padding: '0 0 0 20px',
      borderRadius: '8px',
      marginBottom: '10px',
     }
    return (
      <div className="error" style={errorStyling}>
        <h3>{message}</h3>
      </div>
    )
  }
}

export default App