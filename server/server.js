import config from './../config/config'
import app from './express'
import mongoose from 'mongoose'

// Connection URL
mongoose.Promise = global.Promise
mongoose.connect(config.mongoUri, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true })
/*
mongoose.connection.on('error', () => {
  throw new Error(`unable to connect to database: ${config.mongoUri}`)
})
mongoose.connection.on('open', function (ref) {
  console.log('Connected to mongo server.');
  //trying to get collection nameshnhfngf
  mongoose.connection.db.listCollections().toArray(function (err, names) {
      console.log(names); // [{ name: 'dbname.myCollection' }]
  });
})
*/

// set up a route to redirect http to https
app.get('*', function(req, res) {  
  res.redirect('https://' + req.headers.host + req.url);

  // Or, if you don't want to automatically detect the domain name from the request header, you can hard code it:
  // res.redirect('https://example.com' + req.url);
})

app.listen(config.port, (err) => {
  if (err) {
    console.log(err)
  }
  console.info('Server started on port %s.', config.port)
})

app.listen(443, function() {
  console.log("Express HTTP server listening on port 443" );
});

