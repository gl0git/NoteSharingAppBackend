const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Note = mongoose.model('Note', new Schema({
    user: {type: String, required: true},
    title: {type: String, required: true},
    institution: {type: String, required: true},
    course: {type: String, required: true},
    pdf: {type: Buffer, required: true}
}))

module.exports = Note