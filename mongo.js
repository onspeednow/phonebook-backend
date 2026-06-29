const dns = require('dns')
dns.setServers(['8.8.8.8', '8.8.4.4'])

const mongoose = require('mongoose')

const password = process.argv[2]

const url = `mongodb+srv://kunhantw_db_user:${password}@cluster0.edfxurt.mongodb.net/phonebookApp?retryWrites=true&w=majority&appName=Cluster0`

console.log('connecting to MongoDB...')

mongoose.set('strictQuery', false)

mongoose.connect(url)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch(error => {
    console.log('error:', error.message)
  })

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

// debug
console.log('arguments count:', process.argv.length)
console.log('arguments:', process.argv)

if (process.argv.length === 3) {
  Person.find({}).then(persons => {
    console.log('phonebook:')
    persons.forEach(person => {
      console.log(person.name, person.number)
    })
    mongoose.connection.close()
  })

} else if (process.argv.length === 5) {
  const person = new Person({
    name: process.argv[3],
    number: process.argv[4],
  })

  person.save().then(result => {
    console.log(`added ${person.name} number ${person.number} to phonebook`)
    mongoose.connection.close()
  })
}