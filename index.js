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

app.get('/api/persons/:id',(request, response, next) => {
    const id = request.params.id
    Person.findById(id)
    .then(person => {
        if(person){
            response.json(person)
        }
        else{
            response.status(404).end()
        }
    })
    .catch(error =>{
        next(error)
    })
})

app.delete('/api/persons/:id', (request, response,next) =>{
    const id = request.params.id
    Person.findByIdAndDelete(id)
    .then(out => {
        if(out===null){
            response.send(400).json({error:'id not found'})
        }
        else{
            response.status(204).end()
        }
    })
    .catch(error => {
        next(error)
    })
})

app.post('/api/persons', (request, response,next) => 
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
    
    person.save().then(savedPerson => {
        response.status(200).json(savedPerson)
    })   
    .catch(error => next(error))
})

app.put('/api/persons/:id',(request, response,next) => {
    const person = {
        name: request.body.name,
        number: request.body.number
    }
    Person.findByIdAndUpdate(request.params.id,person, {new:true,runValidators:true})
        .then(updated =>{
            return response.json(updated)
        })
        .catch(error => {
            next(error)
        })
}) 
    
const unknownEndpoint = (request, response) => {
    return response.status(404).send(
        {
            error: 'Endpoint not found'
        }
    )
    next()
}
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.error(error.message)
    if(error.name === 'CastError'){
        return response.status(400).json({error:'malformed Id'})
    }
    if(error.name === 'ValidationError'){
        return response.status(400).json({error:error.message})
    }
    next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
