const moviesModel = require('../Models/moviesModel');
const Movie = require('../Models/moviesModel');
const ApiFeatures = require('../utils/ApiFeatures');
const mongoose = require('mongoose');
const CustomError = require('../utils/ErrorHandlers');

exports.validateBody = (req, res) => {
    if (!req.body.name || !req.body.releaseYear) {
        return res.status(400).json({
            status: 'fail',
            message: 'Not a valid movie data.'
        });
    }
    next();
}

exports.getHighestRated = (req, res, next) => {
    req.query.sort = '-ratings';
    req.query.limit = '5';
    next()
}

exports.getAllMovies = async (req, res, next) => {
    // mongoose.set({debug: true})  ---> It prints the query 
    let features = new ApiFeatures(Movie.find(), req.query).filter().sort().pagination().limitedFields();
    const movies = await features.schema;
    return res.status(200).json({
        status: "success",
        length: movies.length,
        data: {
            movies
        }
    })
}

exports.createMovie = async (req, res, next) => {
    const movie = await Movie.create(req.body);
    return res.status(201).json({
        status: 'success',
        data: {
            movie
        }
    })
}

exports.getMovie = async (req, res, next) => {
    // const movie = await Movie.find({ _id: req.params.id });
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
        const error = new CustomError("Movie with this id not found!", 404);
        return next(error);
    }
    return res.status(200).json({
        status: 'success',
        data: {
            movie
        }
    })
};

exports.updateMovie = async (req, res) => {
    const updatedMovie = await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updatedMovie) {
        const error = new CustomError("Movie with this id not found!", 404);
        return next(error);
    }
    return res.status(200).json({
        status: 'success',
        data: {
            movie: updatedMovie
        }
    });
}

exports.deleteMovie = async (req, res) => {
    const deletedMovie = await Movie.findByIdAndDelete(req.params.id);
    if (!deletedMovie) {
        const error = new CustomError("Movie with this id not found!", 404);
        return next(error);
    }
    return res.status(204).json({
        status: 'success',
        data: null
    })
}

exports.getMovieStats = async (req, res) => {
    const stats = await Movie.aggregate([
        { $match: { ratings: { $gte: 4.5 } } },     // ----> this result will be transferred to next stage
        {
            $group: {
                _id: '$releaseYear',   // ----> field on which data to be group b...pass it null if group to be applied on whole data  
                // _id:null,
                avgRating: { $avg: '$ratings' },
                avgPrice: { $avg: '$price' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' },
                priceTotal: { $sum: '$price' },
                movieCount: { $sum: 1 }
            }
        },
        { $sort: { minPrice: 1 } }, //sort according to minPrice ascending
    ]);
    return res.status(200).json({
        status: 'success',
        count: stats.length,
        data: {
            stats
        }
    })
}

exports.getMovieByGenre = async (req, res) => {
    const genre = req.params.genre;
    const movies = await Movie.aggregate([
        { $unwind: '$genres' },
        {
            $group: {
                _id: '$genres',
                movieCount: { $sum: 1 },
                movies: { $push: "$name" },
            }
        },
        { $addFields: { genre: '$_id' } },
        { $project: { _id: 0 } },
        { $sort: { movieCount: -1 } },
        // {$limit:10},
        { $match: { genre: genre } }
    ]);
    return res.status(200).json({
        status: 'success',
        count: movies.length,
        data: {
            movies
        }
    })
}
