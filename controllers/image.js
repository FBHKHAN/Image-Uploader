var fs = require('fs'),
    path = require('path'),
    sidebar = require('../helpers/sidebar'),
    Models = require('../models'),
    md5 = require('MD5');

module.exports = {
    index: function (req, res) {
        var viewModel = {
            image: {},
            comments: []
        };

        Models.Image.findOne({
                filename: {
                    // Looking for id of the image...
                    $regex: req.params.image_id
                }
            },
            function (err, image) {
                if (err) {
                    throw err;
                }
                if (image) {
                    console.log("IMAGE ID FOUND: " + req.params.image_id);
                    image.views = image.views + 1; // Updating number of views...
                    viewModel.image = image;
                    image.save();

                    Models.Comment.find({
                            image_id: image._id
                        }, {}, {
                            sort: {
                                'timestamp': 1
                            }
                        },
                        function (err, comments) {
                            if (err) {
                                throw err;
                            }
                            viewModel.comments = comments;

                            sidebar(viewModel, function (viewModel) {
                                res.render('image', viewModel);
                            });
                        }
                    );
                } else {
                    res.redirect('/');
                }
            });

    },
    create: function (req, res) {
        var saveImage = function () {
            var possible = 'abcdefghijklmnopqrstuvwxyz0123456789',
                imgUrl = '';

            for (var i = 0; i < 6; i += 1) {
                imgUrl += possible.charAt(Math.floor(Math.random() * possible.length));
            };

            /* Start new code: */
            // search for an image with the same filename by performing a find:
            Models.Image.find({
                filename: imgUrl
            }, function (err, images) {
                if (images.length > 0) {
                    // if a matching image was found, try again (start over):
                    saveImage();
                } else {
                    /* end new code:*/
                    console.log("Path: " + req.file.originalname);
                    console.log("ext: " + path.extname(req.file.originalname).toLowerCase());
                    var tempPath = req.file.path,
                        ext = path.extname(req.file.originalname).toLowerCase(),
                        targetPath = path.resolve('./public/upload/' + imgUrl + ext);

                    if (ext === '.png' || ext === '.jpg' || ext === '.jpeg' || ext === '.gif') {
                        fs.rename(tempPath, targetPath, function (err) {
                            if (err) throw err;
                            var newImg = new Models.Image({
                                title: req.body.title,
                                description: req.body.description,
                                filename: imgUrl + ext
                            });
                            newImg.save(function (err, image) {
                                console.log('Successfully inserted image: ' + image.filename);
                                res.redirect('/images/' + image.uniqueId);
                            });
                            return;
                        });
                    } else {
                        fs.unlink(tempPath, function (err) {
                            if (err) throw err;
                            res.json(500, {
                                error: 'Only image files are allowed.'
                            });
                        });
                    }
                    /* Start new code: */
                }
            });
            /* End new code: */
        };

        saveImage();
    },
    like: function (req, res) {
        res.json({
            likes: 1
        });
    },
    comment: function (req, res) {
        Models.Image.findOne({
                filename: {
                    $regex: req.params.image_id
                }
            },
            function (err, image) {
                if (!err && image) {
                    var newComment = new Models.Comment(req.body);
                    newComment.gravatar = md5(newComment.email);
                    newComment.image_id = image._id;
                    newComment.save(function (err, comment) {
                        if (err) {
                            throw err;
                        }

                        res.redirect('/images/' + image.uniqueId + '#' + comment._id);
                    });
                } else {
                    res.redirect('/');
                }
            });
    }
};
