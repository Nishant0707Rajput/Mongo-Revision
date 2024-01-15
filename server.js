const mongoose = require('mongoose');
require('dotenv').config();
const app = require('./app');

mongoose.connect(process.env.MONGO_URI).then((conn)=>{
    console.log("DB connected successfully.")
}).catch((err)=>{
    console.log("Some error occured while connecting database.");
});

app.use('/api/v1/movies', require('./Routes/moviesRoutes'));

const port = process.env.PORT || 3000;

app.listen(port,()=>{
    console.log("Server has started.... on " + port);
})