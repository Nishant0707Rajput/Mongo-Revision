class ApiFeatures {

    constructor(schema, queryObj) {
        this.schema = schema;
        this.queryObj = queryObj;
        console.log(this.queryObj);
    }

    filter() {
        // *** If enpoint like---> /api/v1/movies?duration=135&ratings=7.9&sort=1 ****
        const excludeFields = ['sort', 'page', 'limit', 'fields'];
        let localQueryObj = { ...this.queryObj };
        excludeFields.forEach((el) => {
            delete localQueryObj[el];
        })
        // const movies = await Movie.find(queryObj);

        // ******* alternate way - chaining mongoose methods ********
        // const movies = await Movie.find().where('duration').equals(this.query.duration).where('ratings').equals(this.query.ratings);

        // ******* ADVANCED FILTERING ********
        // if endpoint like ---> /api/v1/movies?duration[gte]=100&ratings[gte]=7&price[lt]=58
        // then this.query will be {
        //                         duration: { gte: '100' },
        //                         ratings: { gte: '7' },
        //                         price: { lt: '58' }
        //                      }
        let queryStr = JSON.stringify(localQueryObj);
        queryStr = queryStr.replace(/\b(gte|lte|lt|gt)\b/g, (match) => `$${match}`);  //---> to replace 'gte' with '$gte' 
        localQueryObj = JSON.parse(queryStr);
        this.schema = this.schema.find(localQueryObj);
        // can also be done by chaining like ====> where('ratings').gte(duration);
        return this;
    }

    // ******** SORTING IN MONGOOSE **************

    // if endpoint like ---> /api/v1/movies?sort=-releaseYear,ratings 
    // negative sign in sort property signifies sort it in revere order for mongoose
    //  multiple params in sort params means in case of properties having equal values like here for 'releaseYear', it will be sort according  to the next param i.e. 'ratings' in this case .... First it will sort according to 'releaseYear' in descending order(because of negative sign ) then according to next param i.e. 'ratings'
    sort() {
        if (this.queryObj.sort) {
            let sortStr = this.queryObj.sort.split(',').join(' ');    // since sortStr should have space separated parameters
            console.log(sortStr);
            this.schema = this.schema.sort(sortStr);
        } else {
            // in case of no sorting parameter sort it by createdAt by default
            this.schema = this.schema.sort('-createdAt');
        }
        return this;
    }


    // *************** LIMITING FIELDS IN RESPONSE ***********
    // if endpoint like ---> /api/v1/movies?fields=name,releaseYear,actors,ratings
    // To exclude a field use negative sign before the parameter like '-name'. We can only use either inclusion or exclusion while selecting fields e.g. we can not pass fields=-name,release,-actors. They should be all negative or all positive  
    // -------- We can also exclude a property permanently from SCHEMA,  which is not thisuired on client-side e.g. password by setting 'select:false' for that property
    limitedFields() {
        if (this.queryObj.fields) {
            let fieldStr = this.queryObj.fields.split(',').join(' ');    // since fieldStr should have space separated parameters
            this.schema = this.schema.select(fieldStr);
        } else {
            this.schema = this.schema.select('-__v');
        }
        return this;
    }

    pagination() {
        const page = this.queryObj.page * 1 || 1;
        const limit = this.queryObj.limit * 1 || 15;
        const skip = (page - 1) * limit;
        // const totalRecordsLength = await Movie.countDocuments();
        // if(skip>totalRecordsLength){
        //     throw new Error('Not enough records');
        // }
        this.schema = this.schema.skip(skip).limit(limit);
        return this;
    }

}

module.exports = ApiFeatures;