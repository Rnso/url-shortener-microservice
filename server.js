import config from './config'
import express from 'express'
import router from './api'

const server = express()


server.set('view engine', 'ejs')

server.get('/', (req, res) => {
    res.render('index')
}) 


server.use('/', router)

server.listen(config.port, () => {
    console.info('Express Listening on port:', config.port)
})
