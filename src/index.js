const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers

  const user = users.find(user => user.username === username)
 
  if (!user) {
    return response.status(400).json({ error: "Usuário não encontrado"})
  }

  request.user = user
  
  return next()
}

app.post('/users', (request, response) => {
  
  const { name, username } = request.body

  const user = users.find(user => user.username === username)

  if (user)
    return response.status(400).json({error: 'Usuário já existe'})
  
  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(newUser)

  return response.status(200).json(newUser)

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request

  return response.json(user.todos)

});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request

  const { title, deadline } = request.body

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }
  user.todos.push(newTodo)

  return response.status(201).json(newTodo)
  
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params
  const { title, deadline } = request.body

  let updatedTodo = {
    title: title,
    deadline: new Date(deadline),
    done: false
  }

  const index = user.todos.findIndex((todo, index, arr) => {
    if (todo.id === id) {
      return index
    }
  })

  if (index !== -1) {
    user.todos[index] = {
      ...updatedTodo
    }
  } else {
    return response.status(404).json({ ...updatedTodo, error: "Todo não encontrado"})
  }
  
  return response.status(200).json(updatedTodo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params

  const todo = user.todos.find(todo => todo.id == id)

  if (todo){
    todo.done = true
  } else {
    return response.status(404).json({error: "Todo não encontrado"})
  }

  return response.status(200).json(todo)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params

  const index = user.todos.map(todo => todo.id).indexOf(id)

  if (index == -1)
    return response.status(404).json({error: "Todo não encontrado"})

  user.todos.splice(index, 1)
  
  return response.status(204).send()

});

module.exports = app;