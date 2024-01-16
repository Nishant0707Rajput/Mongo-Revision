const mongoose = require('mongoose');
const movieSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true, "Name is required field!"],
        unique:true,
        trim:true
    },
    description:{
        type:String,
        required:[true, "Description is required field!"],
        trim:true
    },
    duration:{
        type:Number,
        required:[true, "Duration is required field!"]
    },
    ratings:{
        type:Number
    },
    totalRating:{
        type:Number
    },
    releaseYear:{
        type:Number,
        required:[true, "Release year is required field!" ]
    },
    releaseDate:{
        type:Date
    },
    createdAt:{
        type:Date,
        default:Date.now(),
        select:false        // Will not be available while selecting data through api
    },
    genres:{
        type:[String],
        required:[true, 'Genres is required field!']
    },
    directors:{
        type:[String],
        required:[true, 'Directors is required field!']
    },
    coverImage:{
        type:String,
        required:[true, 'Cover Image is required field!']
    },
    actors:{
        type:[String],
        required:[true, 'Actors is required field!']
    },
    price:{
        type:Number,
    }
});

module.exports = mongoose.model('Movie', movieSchema);
