// this file sets up the Express app, including middleware and routes. 

const express = require('express'); // user Express
//const routes = require('./routes'); // connect to routes

const app = express();

// Middleware
app.use(express.json()); // for parsing application/json

// Routes
//app.use('/api', routes); 

// error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong.');
});

module.exports = app;