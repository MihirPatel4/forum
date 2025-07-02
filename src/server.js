import express from 'express'
import path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import threadRoutes from './routes/threadRoutes.js'
import authRoutes from './routes/authRoutes.js'
import profileRoutes from './routes/profileRoutes.js'

const app = express()
const PORT = process.env.PORT

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

app.use(express.json())
app.use(express.static(path.join(__dirname, '../public')))

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'))
})

app.use('/threads', threadRoutes)
app.use('/auth', authRoutes)
app.use('/profiles', profileRoutes)

app.listen(PORT, () => {
    console.log(`Server started at http://localhost:${PORT}`)
})