const moviesModel = require('../Models/moviesModel');
const Movie = require('../Models/moviesModel');
const ApiFeatures = require('../utils/ApiFeatures');
const mongoose = require('mongoose');
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

exports.getAllMovies = async (req, res) => {
    try {
        // mongoose.set({debug: true})
        let features = new ApiFeatures(Movie.find(), req.query).filter().sort().pagination().limitedFields();
        const movies = await features.schema;
        return res.status(200).json({
            status: "success",
            length: movies.length,
            data: {
                movies
            }
        })
    } catch (err) {
        console.log(">>>>>>>>>", err);
        return res.status(404).json({
            status: 'fail',
            message: err.message
        })
    }
}

exports.createMovie = async (req, res) => {
    try {
        // const testMovie = new Movie({});
        // testMovie.save();
        const movie = await Movie.create(req.body);
        return res.status(201).json({
            status: 'success',
            data: {
                movie
            }
        })
    } catch (err) {
        console.log(">>>>>>>>>", err);
        return res.status(400).json({
            status: 'fail',
            message: err.message
        })
    }
}

exports.getMovie = async (req, res) => {
    try {
        // const movie = await Movie.find({ _id: req.params.id });
        const movie = await Movie.findById(req.params.id);
        return res.status(200).json({
            status: 'success',
            data: {
                movie
            }
        })
    } catch (err) {
        console.log(">>>>>>>>>", err);
        return res.status(404).json({
            status: 'fail',
            message: err.message
        })
    }
}

exports.updateMovie = async (req, res) => {
    try {
        const updatedMovie = await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        return res.status(200).json({
            status: 'success',
            data: {
                movie: updatedMovie
            }
        });
    } catch (err) {
        return res.status(404).json({
            status: 'fail',
            message: err.message
        });
    }
}

exports.deleteMovie = async (req, res) => {
    try {
        await Movie.findByIdAndDelete(req.params.id);
        return res.status(204).json({
            status: 'success',
            data: null
        })
    } catch (err) {
        return res.status(404).json({
            status: 'fail',
            message: err.message
        });
    }
}

exports.getMovieStats = async (req, res) => {
    try {
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
    } catch (err) {
        return res.status(404).json({
            status: 'fail',
            message: err.message
        });
    }
}

exports.getMovieByGenre = async (req, res) => {
    try {
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
    } catch (err) {
        return res.status(404).json({
            status: 'fail',
            message: err.message
        });
    }
}
