const express = require("express");
const moviesController = require('../Controllers/moviesController');
const { asyncErrorHandler } = require('../Controllers/errorController');


const router = express.Router();

router.route('/highest-rated').get(moviesController.getHighestRated,asyncErrorHandler(moviesController.getAllMovies));
router.route('/movie-stats').get(asyncErrorHandler(moviesController.getMovieStats));
router.route('/moviesByGenre/:genre').get(asyncErrorHandler(moviesController.getMovieByGenre));

router.route('/')
    .get(asyncErrorHandler(moviesController.getAllMovies))
    .post(asyncErrorHandler(moviesController.createMovie));

router.route('/:id')
    .get(asyncErrorHandler(moviesController.getMovie))
    .patch(asyncErrorHandler(moviesController.updateMovie))
    .delete(asyncErrorHandler(moviesController.deleteMovie));


module.exports = router;