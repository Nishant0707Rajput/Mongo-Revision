const mongoose = require('mongoose');
const fs = require('fs');
// this validator can be used only for strings, It has some predefined validations
const validator = require('validator');

const movieSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required field!"],
        unique: true,
        trim: true,
        minlength: [3, "Movie name must have at least 3 characters"],
        maxlength: [30, "Movie name must have at most 30 characters"],
        validate: [validator.isAlpha, "Movie name should contain alphabets only."]    // using third party library for validation
    },
    description: {
        type: String,
        required: [true, "Description is required field!"],
        trim: true
    },
    duration: {
        type: Number,
        required: [true, "Duration is required field!"]
    },
    ratings: {
        type: Number,
        validate: {
            validator: function (value) {
                // if we use 'this.ratings' in place of 'value' then it will only work when creating document and not on update
                return value >= 1 && value <= 10;
            },
            message: "Ratings {VALUE} should be above 1 and below 10"
        }
        // min: [1,"Rating must be greater than 0."],
        // max: [10, "Rating must be less than equal to 10."]
    },
    totalRating: {
        type: Number
    },
    releaseYear: {
        type: Number,
        required: [true, "Release year is required field!"]
    },
    releaseDate: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false        // Will not be available while selecting data through api
    },
    genres: {
        type: [String],
        required: [true, 'Genres is required field!'],
        // enum: { values: ["Action", "Sci-Fi", "Thriller"], message: "Only mentioned genres can be added." }  ---> validators
    },
    directors: {
        type: [String],
        required: [true, 'Directors is required field!']
    },
    coverImage: {
        type: String,
        required: [true, 'Cover Image is required field!']
    },
    actors: {
        type: [String],
        required: [true, 'Actors is required field!']
    },
    price: {
        type: Number,
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Querying data can't work on this, these are not going to be stored in database
// These will be called virtual properties
movieSchema.virtual('durationInHours').get(function () {
    return this.duration / 60;
});


// Document middlewares in mongo - pre-hooks and post-hooks
// pre will be executed just before the event is going to be triggered on the document, here the event is 'save'
// will work for save() and create()
// will not work for insertMany()
movieSchema.pre('save', function (next) {
    let imageName = this.coverImage;
    //appending current timestamp to the coverImage Name just before saving the document.
    imageName = imageName.substring(0, imageName.length - 4) + "_" + Date.now() + imageName.substring(imageName.length - 4, imageName.length);
    this.coverImage = imageName;
    next();
})

// post will be executed just after the event has been triggered on the document, here the event is 'save';
movieSchema.post('save', function (doc, next) {
    const currentDate = new Date();
    let content = `File saved with name ===> ${doc.name} at ${currentDate.toLocaleString()} \n`
    fs.writeFileSync('./Logs/logs.txt', content, { flag: 'a' }, (err) => {
        console.log("Some error occurred while logging >>>>>>> ", err, "\n");
    });
    next();
})

// Implementing query middleware on all query including 'find' by regex
// Removing those movies which are not released yet.
movieSchema.pre(/^find/, function (next) {
    this.find({ releaseDate: { $lte: Date.now() } });
    this.startTime = Date.now();
    next();
})

// Implementing query middleware on all query including 'find' by regex
// finding time taken by a query to execute
movieSchema.post(/^find/, function (docs, next) {
    const timeTakenByQuery = Date.now() - this.startTime;
    let content = `Time taken by previous query is ${timeTakenByQuery} in milliseconds. \n`
    fs.writeFileSync('./Logs/logs.txt', content, { flag: 'a' }, (err) => {
        console.log("Some error occurred while logging >>>>>>> ", err, "\n");
    });
    next();
})

// Implementing aggregate middleware on all aggregate queries
// Removing those movies which are not released yet.
movieSchema.pre('aggregate', function (next) {
    this._pipeline.unshift({ '$match': { releaseDate: { $lte: new Date() } } });      // new Date() because 'find()' function  of mongoose automatically converts Date.now() to new Date but aggregate pipelines do not.
    next();
});


module.exports = mongoose.model('Movie', movieSchema);
