const Movie = require('../Models/moviesModel');

exports.validateBody = (req, res) => {
    if (!req.body.name || !req.body.releaseYear) {
        return res.status(400).json({
            status: 'fail',
            message: 'Not a valid movie data.'
        });
    }
    next();
}

exports.getAllMovies = async (req, res) => {
    try {
        const excludeFields = ['sort', 'page', 'limit', 'fields'];
        const queryObj = {...req.query};

        excludeFields.forEach((el)=>{
            delete queryObj[el];
        })
        const movies = await Movie.find(queryObj);

        // const movies = await Movie.find().where('duration').equals(req.query.duration).where('ratings').equals(req.query.ratings);

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