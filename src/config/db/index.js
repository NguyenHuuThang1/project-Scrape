const mongoose = require('mongoose');
async function connect(){

    try {
        await mongoose.connect('mongodb://localhost:27017/Data_price');
        console.log('SUCCESSFULLY');

        return mongoose.connection;
    } catch (error) {
       console.log('FAILURE') ;
    }

}

module.exports = { connect };