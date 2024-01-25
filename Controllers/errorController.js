const CustomError = require("../utils/ErrorHandlers");

const devErrors = (res, error)=>{
    error.statusCode = error.statusCode || 500;
    error.status = error.status || 'error';
    res.status(error.statusCode).json({
        status: error.status,
        message: error.message,
        error,
        stackTrace:error.stack
    })
}

const prodErrors = (res, error) => {
    if(error.isOperational){
        error.statusCode = error.statusCode || 500;
        error.status = error.status || 'error';
        res.status(error.statusCode).json({
            status: error.status,
            message: error.message
        })
    }else{
        res.status(500).json({
            status:'error',
            message:"Something went wrong, Please try again later."
        })
    }
}

const castErrorHandler = (error)=>{
    const msg = `Invalid value for ${error.path}: ${error.value}`;
    const locError = new CustomError(msg, 400);
    return locError;
}


exports.getCustomError = (error, req, res, next) => {
    if(process.env.NODE_ENV === 'production'){
        // We can handle errors for the production for better user experience, sending only necessary errors
        if(error.name === 'CastError'){
            error = castErrorHandler(error);
        }
        prodErrors(res,error);
    }else {
        devErrors(res, error);
    }
}

exports.asyncErrorHandler = (func)=>{
    return (req,res,next)=>{
        func(req,res,next).catch(err=>{
            // console.log(err);
            next(err)});
    }
}