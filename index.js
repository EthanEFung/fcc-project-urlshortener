require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

// TODO: set up mongo connection using mongoose
// TODO: set up .gitignore file to make sure that your MONGO_URI is not exposed

// TODO: define a schema for the urls. This should contain
// - original url as a string
// - we should validate that the url is true using 'dns'
//   module https://nodejs.org/api/dns.html. `dns.lookup(host, cb)`
// - we can rely on the models id for the shorturl

app.use(cors());

// TODO: add body parser middleware

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
})

app.post('/api/shorturl', (req, res) => {
  // TODO:
  // here we'll check the body of the request to find the original url.
  // Before creating the shorturl, we want to search to see whether this url already
  // exists in our persisted state, and return the previously cached persisted state.
  // Else we create the shorturl (relying on the id of the mongo instance)
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
