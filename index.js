const express = require('express')
const app = express()

app.use(express.json())


let persons = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.get('/', (request, response) => {
    response.send('Hello World!')
})

app.get('/info', (request, response) => {
    const dateTime = new Date()
    const count = persons ? persons.length : 0
    response.send(`<P>Phonebook has info for ${count} people<p/> <p> ${dateTime}<p/>`)
})

app.get('/api/persons',(request, response) =>
{
    response.json(persons)
})

app.get('/api/persons/:id',(request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(p => p.id === id)
    if(person){
        response.json(person)
    }
    else{
        response.status(404).end()
    }
})

app.delete('/api/persons/:id', (request, response) =>{
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)
    response.status(204).end()
})

app.post('/api/persons', (request, response) => 
{
    const person = request.body
    if(!person.name){
        return response.status(400).json({
                 error:'Name can not be empty'
            });
    }
    if(!person.number){
        return response.status(400).json({
                error:'Number can not be empty'
             })
    }
    const exisitngName = persons.find(p => p.name === person.name)
    if(exisitngName){
        return response.status(400).json({
            error:'Name already exists'
        })
    }
    const id = getRandomInt(1,10000)
    person.id = id
    persons = persons.concat(person)
})


const PORT = 3001
app.listen(PORT,() => {
    console.log(`Server is running on port ${PORT}`)
})

function getRandomInt(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
  }
  