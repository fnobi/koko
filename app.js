var express = require('express')
  , http    = require('http')
  , fs      = require('fs')
  , path    = require('path');

var dirname = process.argv[2] || '';
var dirpath = path.resolve(dirname);

if (!fs.existsSync(dirpath)) {
        console.error('"%s" does\'nt exist.', dirpath);
        process.exit();
}

console.log('[DocumentRoot: %s]', dirpath);

var app = express();
var port = Math.floor(Math.random() * 9999);

app.configure(function(){
        app.use(express.static(dirpath));
});

http.createServer(app).listen(port, function(){
        console.log("Express server listening on port " + port);
});
