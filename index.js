var express   = require('express')
  , http      = require('http')
  , fs        = require('fs')
  , path      = require('path')
  , emptyPort = require('empty-port');

var Koko = function () {
    var dirname = process.argv[2] || '';
    var dirpath = path.resolve(dirname);

    if (!fs.existsSync(dirpath)) {
        console.error('"%s" does\'nt exist.', dirpath);
        process.exit();
    }

    console.log('[DocumentRoot: %s]', dirpath);

    var app = express();
    app.configure(function(){
        app.use(express.static(dirpath));
    });

    emptyPort( { }, function (err, port) {
        if (err) {
            console.error('error on picking port.');
            process.exit();
        }

        http.createServer(app).listen(port, function(){
            console.log("Express server listening on port " + port);
        });
    } );
};

module.exports = Koko;