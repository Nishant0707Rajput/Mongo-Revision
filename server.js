const mongoose = require('mongoose');
require('dotenv').config();

// To handle synchronous code error
process.on('uncaughtException', (err) => {
    console.log(err.name, err.message);
    console.log('Uncaught Exception occured!');
})


const app = require('./app');
const { getCustomError } = require('./Controllers/errorController');
const CustomError = require('./utils/ErrorHandlers');

mongoose.connect(process.env.MONGO_URI).then((conn) => {
    console.log("DB connected successfully.")
}).catch((err)=>{
    console.log("Error in connecting to database", err);
})

app.use('/api/v1/movies', require('./Routes/moviesRoutes'));
app.all('*', (req, res, next) => {
    const err = new CustomError(`Can't find url - ${req.originalUrl} on the server!`, 404);
    next(err);
})

app.use(getCustomError);

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
    console.log("Server has started.... on " + port);
})

// To handle asynchronous code error i.e. rejected promises
process.on('unhandledRejection', (err) => {
    console.log(err.name, err.message);
    console.log('Unhandled rejection occured! Shutting down');
    server.close(() => {
        process.exit(1);
    })
})