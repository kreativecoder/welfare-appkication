import express from 'express';
import morgan from 'morgan';

import user from '../routes/api/authUser';
import item from '../routes/api/items';
import savings from '../routes/api/savings';
import loans from '../routes/api/loans';
import purchase from '../routes/api/purchase';

import dbConnection from '../config/dbconnection';


// Initializing App
const app = express();

// Middlewares
// Body parser
app.use(express.json());
app.use(express.urlencoded({extended: true}))

// Seeting Mogan
app.use(morgan('tiny'))

// Database connection
dbConnection();

// routes
app.use('/auth/user', user);
app.use('/item', item);
app.use('/loan', loans);
app.use('/saving', savings);
app.use('/purchase', purchase);

app.get('/', (req, res)=>{
  res.send("Welcome to cooporative-app Home")
})

app.use((req, res, next) => {
  const error = new Error("Resource Not Found");
  error.status = 404;
  next(error);
});


// for any other routes that does not exist
app.all('*', (req, res) => res.status(404).send({
  status: 'error',
  message: 'Sorry the page you are trying to fetch does not exist',
}));

app.use((error, req, res, next) => {
  res.status(error.status || 500).json({
    error: {
      message: error.message
    }
  });
});

// running server
const port = process.env.PORT || 9000;


app.listen(port, ()=>{
  console.log("Application started on port", port)
})
