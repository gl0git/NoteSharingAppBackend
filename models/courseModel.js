const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Course = mongoose.model('Course', new Schema({
    title: {type: String, required: true},
    institution: {type: String, required: true},
}))

module.exports = Course
