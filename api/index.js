import express from 'express'
import moment from 'moment'
import { MongoClient, ObjectID } from 'mongodb'
import assert from 'assert'
import config from '../config'

let mdb;
MongoClient.connect(config.mongodbUri, (err, db) => {
    assert.equal(null, err)
    mdb = db
})
const router = express.Router()

router.get('/api/*', (req, res) => {
    let urlInfo = {}
    let shortUrl
    let regEx = /^https?:\/\/(\S+\.)?(\S+\.)(\S+)\S*/
    if (regEx.test(req.params[0])) {
        urlInfo.inputUrl = req.params[0]
        urlInfo.shortUrl = req.headers.host + '/' + (Math.floor(Math.random() * 9000) + 1000).toString()
        urlInfo.createdDate = moment().format()
        mdb.collection('ShortURLs').find({ inputUrl: req.params[0] }).toArray((err, urls) => {
            console.log(urls.length)
            if (urls.length === 0) {
                mdb.collection('ShortURLs').insert(urlInfo)
            }
            mdb.collection('ShortURLs').findOne({ inputUrl: req.params[0] }, { inputUrl: 1, shortUrl: 1, _id: 0 }).then((url) => {
                res.send(url)
            })
        })
    }
    else {
        res.send({ 'error': 'Invalid url' })
    }

})

router.get('/:shortUrl', (req, res) => {
    console.log(req.headers.host + '/' + req.params.shortUrl)
    let url = req.headers.host + '/' + req.params.shortUrl
    mdb.collection('ShortURLs').findOne({ shortUrl: url }).then((sUrl) => {
        res.redirect(sUrl.inputUrl)
    })
})


export default router