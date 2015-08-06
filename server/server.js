require('./environment');
var database       = require('./database').connect();
var express        = require('express');
var app            = express();

require('./express')(app);
require('./routes')(app);

app.listen(3030);
console.log('Listening on port: 3030');
