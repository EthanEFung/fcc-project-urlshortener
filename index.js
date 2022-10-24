const URL = require('node:url').URL;
const dns = require('node:dns');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

require('dotenv').config();

const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

mongoose.connect(
  process.env.MONGO_URI,
  { useNewUrlParser: true, useUnifiedTopology: true }
)
  .then((res) => console.log('established db connection'))
  .catch(console.error);

const ShortUrlSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
})

const counter = mongoose.model('shortUrl', ShortUrlSchema)

const UrlSchema = new mongoose.Schema({
  original_url: {
    type: String,
    required: true,
    unique: true
  },
  short_url: { type: Number }
});

UrlSchema.pre('save', function(next) {
  const doc = this;
  counter.findByIdAndUpdate(
    { _id: 'entityId'},
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  )
    .then((count) => {
      console.log("...count: "+JSON.stringify(count))
      doc.short_url = count.seq;
      next()
    })
    .catch((err) => {
      console.error("counter error: "+err)
      throw err
    })
})

const Model = new mongoose.model('Url', UrlSchema);


// TODO: 
// - we should validate that the url is true using 'dns'
//   module https://nodejs.org/api/dns.html. `dns.lookup(host, cb)`

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.get('/api/shorturl/:shorturl', (req, res) => {
  // TODO:
  // here we'll want to search the persisted state to find
  // if the the shorturl is there
  // if not, send back a response {"error":"No short URL found for the given input"}
  // otherwise this should find the original url and redirect the user
  // to that url
  console.log({ short_url: req.params.shorturl })
  Model.findOne({ short_url: req.params.shorturl }, (err, doc) => {
    if (!doc) {
      res.status(304).send({ error: "No short URL found for the given input"})
      return
    }
    if (err) {
      res.status(500).send({ error: err })
      return
    }
    res.writeHead(302, { Location: doc.original_url })
    res.end()
  }) 
})

app.post('/api/shorturl', (req, res) => {
  try {
    const url = new URL(req.body.url);
    dns.lookup(url.host, (err, address, family) => {
      if (err) {
        res.send({ error: "invalid url" })
        return
      }
      Model.findOne({ original_url: req.body.url }, (err, shortened) => {
        if (shortened) {
          const { original_url, short_url } = shortened;
          res.send({ original_url, short_url })
          return
        }

        const newShortened = new Model({
          original_url: req.body.url
        });

        newShortened.save()
          .then(({ short_url, original_url}) => {
            res.send({ original_url, short_url })
          })
          .catch((err) => {
            console.log('findOne issue', err)
            res.send({ error: err })
          })
      })
      
    }) 
  } catch (e) {
    res.send({ error: 'invalid url' })
  }
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
