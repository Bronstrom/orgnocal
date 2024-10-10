import express from 'express'
import dotenv from 'dotenv'
import bodyParser from 'body-parser'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'

import projectRoutes from './routes/projectRoutes'
import taskRoutes from './routes/taskRoutes'
import userRoutes from './routes/userRoutes'
import orgRoutes from './routes/orgRoutes'
import viewRoutes from './routes/viewRoutes'
import layerRoutes from './routes/layerRoutes'
import commentRoutes from './routes/commentRoutes'
import searchRoutes from './routes/searchRoutes'

// General configurations
dotenv.config()
const app = express()
app.use(express.json())
app.use(helmet())
app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }))
app.use(morgan('common'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cors())

// Routes
app.get('/', (_request, response) => {
  response.send("This is the home route for Orgnocal")
})
app.use('/projects', projectRoutes)
app.use('/tasks', taskRoutes)
app.use('/users', userRoutes)
app.use('/orgs', orgRoutes)
app.use('/views', viewRoutes)
app.use('/layers', layerRoutes)
app.use('/comments', commentRoutes)
app.use('/search', searchRoutes)

// Server
const port = Number(process.env.PORT) || 3000
app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port: ${port}`)
})
