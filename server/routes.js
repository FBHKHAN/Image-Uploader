var express = require('express'),
    router = express.Router(),
    home = require('../controllers/home'),
    image = require('../controllers/image'),
    multer = require('multer'),
    path = require('path'),
    fs = require ('fs'),
    upload = multer({dest: '../public/upload/temp'});

module.exports = function (app) {
    router.get('/', home.index);
    router.get('/images/:image_id', image.index);
    router.post('/images',upload.single('file'),image.create);
    router.post('/images/:image_id/like', image.like);
    router.post('/images/:image_id/comment', image.comment);
    app.use(router);
};
