const express = require('express');
const app = express();
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const logger = require('morgan');

const config = require('./services/middleware/config')
app.set('api_key', config.api_key);

const index = require('./routes/index');
const users = require('./routes/users');
const operating = require('./routes/operating');
const campaign = require('./routes/campaign');
const operations = require('./routes/operations');
const staff = require('./routes/staff');
const appointment = require('./routes/appointment');
const feedback = require('./routes/feedback');


const db = require('./services/mongodb.js')();


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'))
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users)
app.use('/operating', operating)
app.use('/campaign', campaign)
app.use('/operations', operations)
app.use('/staff', staff)
app.use('/appointment', appointment)
app.use('/feedback', feedback)


app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json({ error: { message: err.message, code: err.code } });
});

module.exports = app;

