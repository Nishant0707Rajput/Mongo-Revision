const mongoose = require('mongoose');
require('dotenv').config();
const fs = require('fs');
const Movie = require('../Models/moviesModel');

mongoose.connect(process.env.MONGO_URI).then((conn) => {
    console.log("Database has been connected successfully.",);
}).catch(err => {
    console.log("Some error occured in db Connection ", err);
})

const movies = JSON.parse(fs.readFileSync('./data/movies.json','utf-8'));

const deleteData = async ()=>{
    try{
        await Movie.deleteMany();
        console.log('Data has been deleted successfully');
    }catch(err){
        console.log(err);
    }
    process.exit();
}

const importData = async () =>{
    try{
        await Movie.create(movies);
        console.log("Data imported successfully");
    }catch(err){
        console.log(err);
    }
    process.exit();
}

if(process.argv[2]=='--import'){
    importData();
}
if(process.argv[2]=='--delete'){
    deleteData();
}

