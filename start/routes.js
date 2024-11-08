import express from 'express'
import 'dotenv/config'
import LessonsController from '../app/Controllers/LessonsController.js'
import { validateLessons } from '../app/Validators/LessonsValidator.js'

const app = express()
const port = process.env.PORT

const lessonsController = new LessonsController()

app.get('/lessons', validateLessons, (req, res) => lessonsController.index(req, res))

app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`)
})
