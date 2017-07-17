import express from 'express'
import moment from 'moment'
import { MongoClient, ObjectID } from 'mongodb'
import assert from 'assert'
import config from '../config'
import urlRegex from 'url-regex'

let mdb;
MongoClient.connect(config.mongodbUri, (err, db) => {
    assert.equal(null, err)
    mdb = db
})
const router = express.Router()

router.get('/api/*', (req, res) => {
    let urlInfo = {}
    let shortUrl
    if (urlRegex().test(req.params[0])) {
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
        res.send({ 'error': 'Invalid url. Make sure that the site exist' })
    }

})

router.get('/:shortUrl', (req, res) => {
    let url = req.headers['x-forwarded-proto'].split(',')[0] + '://' + req.headers.host + '/' + req.params.shortUrl
    mdb.collection('ShortURLs').findOne({ shortUrl: url }).then((sUrl) => {
      console.log(sUrl)
      let regex = /(https:\/\/)|(https:\/\/)/
      if(regex.test(sUrl.inputUrl)){
        res.redirect(sUrl.inputUrl)
      }
      else{
        res.redirect('http://' + sUrl.inputUrl)
      }
    })
})


export default router