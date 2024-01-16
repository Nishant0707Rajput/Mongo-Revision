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

exports.getHighestRated = (req, res,next) =>{
    req.query.sort = '-ratings';
    req.query.limit = '5';
    next()
}

exports.getAllMovies = async (req, res) => {
    try {

        // *** If enpoint like---> /api/v1/movies?duration=135&ratings=7.9&sort=1 ****
        const excludeFields = ['sort', 'page', 'limit', 'fields'];
        let queryObj = {...req.query};
        excludeFields.forEach((el)=>{
            delete queryObj[el];
        })
        // const movies = await Movie.find(queryObj);


        // ******* alternate way - chaining mongoose methods ********
        // const movies = await Movie.find().where('duration').equals(req.query.duration).where('ratings').equals(req.query.ratings);

        // ******* ADVANCED FILTERING ********
        // if endpoint like ---> /api/v1/movies?duration[gte]=100&ratings[gte]=7&price[lt]=58
        // then req.query will be {
        //                         duration: { gte: '100' },
        //                         ratings: { gte: '7' },
        //                         price: { lt: '58' }
        //                      }
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|lte|lt|gt)\b/g, (match)=> `$${match}`);  //---> to replace 'gte' with '$gte' 
        queryObj = JSON.parse(queryStr);
        let query =  Movie.find(queryObj);
        // can also be done by chaining like ====> where('ratings').gte(duration);
        
        // ******** SORTING IN MONGOOSE **************

        // if endpoint like ---> /api/v1/movies?sort=-releaseYear,ratings 
        // negative sign in sort property signifies sort it in revere order for mongoose
        //  multiple params in sort params means in case of properties having equal values like here for 'releaseYear', it will be sort according  to the next param i.e. 'ratings' in this case .... First it will sort according to 'releaseYear' in descending order(because of negative sign ) then according to next param i.e. 'ratings'
        if(req.query.sort){
            let sortStr  = req.query.sort.split(',').join(' ');    // since sortStr should have space separated parameters
            query = query.sort(sortStr); 
        }else{
            // in case of no sorting parameter sort it by createdAt by default
            query =  query.sort('-createdAt'); 
        }

        // *************** LIMITING FIELDS IN RESPONSE ***********
        // if endpoint like ---> /api/v1/movies?fields=name,releaseYear,actors,ratings
        // To exclude a field use negative sign before the parameter like '-name'. We can only use either inclusion or exclusion while selecting fields e.g. we can not pass fields=-name,release,-actors. They should be all negative or all positive  
        // -------- We can also exclude a property permanently from SCHEMA,  which is not required on client-side e.g. password by setting 'select:false' for that property
        if(req.query.fields){
            let fieldStr  = req.query.fields.split(',').join(' ');    // since fieldStr should have space separated parameters
            query = query.select(fieldStr); 
        }else{
            query =  query.select('-__v'); 
        }

        if(req.query.page||req.query.limit){
            const page = req.query.page*1 || 1;
            const limit = req.query.limit*1 || 10;
            const skip = (page - 1) * limit;
            const totalRecordsLength = await Movie.countDocuments();
            if(skip>totalRecordsLength){
                throw new Error('Not enough records');
            }
            query = query.skip(skip).limit(limit);
        }

        const movies = await query;

        return res.status(200).json({
            status: "success",
            length: movies.length,
            data: {
                movies
            }
        })
    } catch (err) {
        // console.log(">>>>>>>>>", err);
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