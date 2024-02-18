const mongoose = require('mongoose')
if(process.argv.length <3){
  console.log('Invalid number of arguments')
  process.exit(1)
}

const password = process.argv[2]
const name = process.argv[3]
const number = process.argv[4]

const url =`mongodb+srv://fullstack:${password}@phonebook.zjqokhz.mongodb.net/?retryWrites=true&w=majority`
mongoose.set('strictQuery',false)
mongoose.connect(url)

const personSchema = mongoose.Schema({
  name:String,
  number:String
})
const Person = mongoose.model('Person', personSchema)

const save = (person) => person.save().then(() => {
  console.log(`Added ${person.name}, Number ${person.number} to phonebook`)
  mongoose.connection.close()
})

if(process.argv.length === 5){
  const person = new Person({
    name : name,
    number : number
  })
  save(person)
}
else {
  Person.find({}).then(result => {
    console.log('Phonebook')
    result.map(person => {
      console.log(`${person.name} ${person.number}`)
    })
    mongoose.connection.close()
  })
}

