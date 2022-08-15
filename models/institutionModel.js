const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Institution = mongoose.model('Institution', new Schema({
    name: {type: String, required: true},
    courses: {type: Array, required: false},
}))

module.exports = Institution