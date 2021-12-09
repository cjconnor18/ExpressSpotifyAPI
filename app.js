const express = require('express');
const morgan = require('morgan');
const loginRoutes = require('./routes/loginRoutes');


const app = express();

//set up server
app.listen(process.env.PORT || 3000);

//set view engine
app.set('view engine', 'ejs');

//middleware & static files
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use((req, res, next) => {
  res.locals.path = req.path;
  next();
})

//routes
app.get('/', (req, res) => {
  res.render('index');
})

app.use('/login', loginRoutes)


