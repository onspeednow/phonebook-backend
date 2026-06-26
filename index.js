const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
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



let persons = [
  { id: "1", name: "Arto Hellas", number: "040-123456" },
  { id: "2", name: "Ada Lovelace", number: "39-44-5323523" },
  { id: "3", name: "Dan Abramov", number: "12-43-234345" },
  { id: "4", name: "Mary Poppendieck", number: "39-23-6423122" }
]

// Exercise 3.1
// 建立一個 route：
// GET /api/persons
// 回傳所有 persons 資料（JSON 格式）
app.get('/api/persons', (request, response) =>{
    return response.json(persons)
})


// Exercise 3.2
// 建立一個 route：
// GET /info
// 回傳兩件事：
//   1. "Phonebook has info for X people"（X 是 persons 的數量）
//   2. 現在的時間（用 new Date() 取得）
app.get('/info', (request, response) => {
    const count = persons.length
    const reply = `Phonebook has info for ${count} people`
    return(
        response.send(`${reply} <br> ${new Date()}`)
        
    )
})

// GET /api/persons/:id
// 如果找到 → 回傳該筆資料
// 如果找不到 → 回傳 404
app.get('/api/persons/:id', (request, response) => {
  const id = request.params.id
  const found = persons.find(p => p.id === id)
  if (found){
    response.json(found)
    } else {
        response.status(404).end()
    }
    })

// DELETE /api/persons/:id
// 刪除成功 → 回傳狀態碼 204，沒有內容
app.delete('/api/persons/:id', (request, response) => {
  const id = request.params.id
  persons = persons.filter(p => p.id !== id)
  return response.status(204).end()
})

// POST /api/persons
// 從 request.body 取出 name 和 number
// 產生新的 id（用 Math.random() 產生隨機數字，教材建議這樣做）
// 把新資料加進 persons
// 回傳新增的資料
app.post('/api/persons', (request, response) => {
    const body = request.body
        // 驗證：name 或 number 是空的
    if (!body.name || ! body.number) {
        return response.status(400).json({ error: 'The number or name is empty' })
    }

    // 驗證：name 已存在
    if (persons.find(p => p.name === body.name)) {
        return response.status(400).json({ error: 'The person is already existed' })
    }
    const newPerson = {
        name: body.name, 
        number: body.number,
        id: String(Math.round(Math.random() * 10000))
    }
    persons = persons.concat(newPerson)
    response.json(newPerson)
})







const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})