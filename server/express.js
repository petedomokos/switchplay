import express from 'express'
import path from 'path'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import compress from 'compression'
import cors from 'cors'
import helmet from 'helmet'
import template from './../template'
import nonuserRoutes from './routes/nonuser.routes'
import userRoutes from './routes/user.routes'
import groupRoutes from './routes/group.routes'
import datasetRoutes from './routes/dataset.routes'
import journeyRoutes from './routes/journey.routes'
import authRoutes from './routes/auth.routes'

//comment out before building for production
import devBundle from './devBundle'

const CURRENT_WORKING_DIR = process.cwd()
const app = express()

//comment out before building for production
devBundle.compile(app)

app.use(express.static('assets'))
//app.use(express.static('assets', {fallthrough: true}))

// parse body params and attache them to req.body
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(compress())
// secure apps by setting various HTTP headers
//app.use(helmet())
app.use( helmet({ contentSecurityPolicy: false, }) );
// enable CORS - Cross Origin Resource Sharing
app.use(cors())

app.use('/dist', express.static(path.join(CURRENT_WORKING_DIR, 'dist')))

// mount routes
app.use('/', nonuserRoutes)
app.use('/', userRoutes)
app.use('/', groupRoutes)
app.use('/', datasetRoutes)
app.use('/', journeyRoutes)
app.use('/', authRoutes)
app.use('/', journeyRoutes)

app.get('*', (req, res) => {
  res.status(200).send(template())
})

export default app
