const mongoose = require('mongoose');
  module.exports = () => {
    mongoose.connect('mongodb://ekuaforum:ekuaforum12@ds119445.mlab.com:19445/heroku_n2clwx9v', { useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});    
      mongoose.connection.on('open', () => {
      });
        mongoose.connection.on('error', (err) => {
        console.log('MongoDB: Error', err);
  });
        
  mongoose.Promise = global.Promise;
};
