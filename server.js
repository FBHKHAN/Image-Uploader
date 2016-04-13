var express = require('express'),
    config = require('./server/configure'),
    app = express(),
    mongoose = require('mongoose');

app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');

app = config(app);

mongoose.connect('mongodb://heroku_g5dd4b63:47jv6ioesmq0qk09r024tn4tp5@ds023550.mlab.com:23550/heroku_g5dd4b63');
mongoose.connection.on('open', function() {
    console.log('Mongoose connected.');
});

var server = app.listen(app.get('port'), function () {
    console.log('Server up: http://localhost:' + app.get('port'));
});
