const mongoose = require('mongoose');
const slug = require('mongoose-slug-updater');
const Schema = mongoose.Schema;
const mongooseDelete = require('mongoose-delete');

const Course = new Schema({
    name: String,
    price: String,
    img: String,
    link: String,
    details: String,
    slug: {type:String, slug: 'name'},
  },
{
  timestamps : true
});

const ItemSchema = new Schema({
  name: String,
  price: String,
  img: String,
}, {
  timestamps: true
});

mongoose.plugin(slug);
Course.plugin(mongooseDelete, { 
  deletedAt: true,
  overrideMethods: 'all' });


module.exports = mongoose.model('course', Course);
//module.exports = mongoose.model('Item', ItemSchema);