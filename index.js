require('dotenv').config()        // ← 最先載入！
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const Person = require('./models/person')  // ← 載入 Person model
const app = express()

app.use(cors())
app.use(express.static('dist'))
app.use(express.json())

// 自訂一個新的 token 叫做 'body'
morgan.token('body', (request) => {
  return JSON.stringify(request.body)
})
// 使用自訂格式，包含這個 token
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))


// Exercise 3.1
// 建立一個 route：
// GET /api/persons
// 回傳所有 persons 資料（JSON 格式）
app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})


app.get('/info', (request, response, next) => {
  Person.countDocuments({})
    .then(count => {
      response.send(`Phonebook has info for ${count} people <br> ${new Date()}`)
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

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

// POST /api/persons
// 從 request.body 取出 name 和 number
// 產生新的 id（用 Math.random() 產生隨機數字，教材建議這樣做）
// 把新資料加進 persons
// 回傳新增的資料
app.post('/api/persons', (request, response, next) => {
  const body = request.body

  if (!body.name || !body.number) {
    return response.status(400).json({ error: 'The number or name is empty' })
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person.save()
    .then(savedPerson => {
      response.json(savedPerson)
    })
    .catch(error => next(error))  // ← 加上這個！
})


app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body

  Person.findByIdAndUpdate(
    request.params.id,
    { name, number },
    { new: true, runValidators: true, context: 'query' }
  )
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})


const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}


app.use(errorHandler)  // ← 必須放在所有 route 的後面！


const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})