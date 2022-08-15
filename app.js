var express = require('express');
require('dotenv').config()
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors')
var fileUpload = require('express-fileupload')
var fs = require('fs')
var busboy = require('connect-busboy')
var mongodb = require('mongodb')
var bodyParser = require('body-parser')
var jwt = require('jsonwebtoken')

var mongoose = require('mongoose');
var bcrypt = require('bcryptjs')
var { nextTick } = require('process');
var Institution = require('./models/institutionModel')
var Note = require('./models/noteModel');
var User = require('./models/userModel')
var Course = require('./models/courseModel')
const { userInfo } = require('os');

const mongoDB = process.env.CONNECTION_URI
mongoose.connect(mongoDB, {useUnifiedTopology: true, useNewUrlParser: true})
const db = mongoose.connection;
db.on("error", console.error.bind(console, "mongo connection error"));
var app = express();

app.use(bodyParser.json())
app.use(busboy())
app.use(fileUpload())
app.use(cors())
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const authenticateToken = async (req, res, next) => {
  const authorizationHeader = req.headers.authorization
  const token = authorizationHeader && authorizationHeader.split(' ')[1]

  await jwt.verify(token, 'secret', (err, user) => {
    if (err) {
      console.log(err)
      return res.status(403)
    }
    req.user = user 
    next()
  })
} 

app.get('/authenticate', authenticateToken, (req, res, next) => {
  res.json({user: req.user})
})

app.post('/signup', (req, res, next) => {
  const unhashedPassword = req.body.password 
  let password;
  bcrypt.hash(`${unhashedPassword}`, 10, (err, hashedPassword) => {
    if (err) return console.log(err)
    const user = new User({
      username: req.body.username,
      password: hashedPassword
    }).save(err => {
      if (err) {
        console.log(err)
        return next(err)
      } 
    })
  })
  res.end()
})

app.post('/login', (req, res) => { 
  User.findOne({username: req.body.username}, (err, user) => {
    if (err) {
      console.log(err)
      return res.status(500).send()
    }
    bcrypt.compare(req.body.password, user.password, (err, response) => {
      if (err) {
        return console.log(err)
      }
      if (response) {
        const userInfo = {name: req.body.username, password: req.body.password}
        const accessToken = jwt.sign(userInfo, 'secret')
        res.json({'accessToken': accessToken})
      }
    }) 
  })
})

app.get('/courses/:university', (req, res) => {
    Course.find({institution: req.params.university}, (err, courses) => {
        if (err) {
            console.log(err); 
            res.status(500).send();
          } else {
            const courseNames = courses.map(course => course.title)
            res.json({"courses": courseNames})
          }
    })
})

app.get('/notes/:course/:university', (req, res) => {
    Note.find({institution: req.params.university, course: req.params.course}, (err, notes) => {
      if (err) {
        console.log(err)
        res.status(500).send()
      } else {
        res.json({'notes': notes})
      }
    })
})

app.get('/note/:id', (req, res) => {
  Note.findOne({id: req.params.id}, (err, note) => {
    if (err) {
      console.log(err)
      res.status(500).send()
    } else {
      res.json({'note': note})
    }
  })
})

app.post('/newcourse/:university', (req, res, next) => {
  const course = new Course({
    title: req.body.course,
    institution: req.params.university
  }).save(err => {
    if (err) {
      console.log(err)
      return next(err)
    }
  })
  res.end()
})

app.post('/newnote/:university', (req, res, next) => {
  const note = new Note({
      user: req.body.name,
      title: req.body.title,
      institution: req.params.university,
      course: req.body.course,
      pdf: req.files.file.data
    }).save(err => {
      if (err) {
        console.log(err)
        return next(err)
      }
    }) 
    res.end()
})

module.exports = app;
