require('dotenv').config()

const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')
const app = express()
app.use(express.json())
app.use(cors())
app.use(express.static('dist'))

morgan.token('postData', (request, response) =>{
    return Object.keys(request.body).length > 0 ? JSON.stringify(request.body) : undefined
 })
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :postData'))

const getRandomInt = (min, max) => {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
}
  
const unknownEndpoint = (request, response) => {
    return response.status(404).send(
        {
            error: 'Endpoint not found'
        }
    )
}

app.get('/', (request, response) => {
    response.send('Hello World!')
})

app.get('/info', (request, response) => {
    const dateTime = new Date()
    Person.countDocuments({}).count().exec()
        .then(count => {
             response.send(`<P>Phonebook has info for ${count} people<p/> <p> ${dateTime}<p/>`)
        })
})

app.get('/api/persons',(request, response) =>
{
    Person.find({}).then(people => {
        response.json(people)
    })
})

app.get('/api/persons/:id',(request, response) => {
    const id = Number(request.params.id)
    Person.findById(id).then(person => {
        if(person){
            response.json(person)
        }
        else{
            response.status(404).end()
        }
    })
})

app.delete('/api/persons/:id', (request, response) =>{
    const id = request.params.id
    Person.where({_id:id}).findOneAndDelete()
    .then(out => {
        response.status(204).end()
    })
    .catch(error => {
        console.log(error.message)
    })
})

app.post('/api/persons', (request, response) => 
{
    const person = new Person({
        name : request.body.name,
        number : request.body.number
    })

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
    /*Person.where({name:person.name}).findOne()
        .then(existing => {
            if(existing.id){
                return response.status(400).json({
                    error:'Name already exists'
                })
            }
        })
    if(exisitngName){
        return response.status(400).json({
            error:'Name already exists'
        })
    }*/

    person.save().then(savedPerson => {
        response.status(200).json(savedPerson)
    })
    //const id = getRandomInt(1,10000)
    //person.id = id
    //persons = persons.concat(person)
})

app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
