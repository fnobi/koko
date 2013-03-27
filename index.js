var express   = require('express')
  , http      = require('http')
  , fs        = require('fs')
  , emptyPort = require('empty-port');

var Koko = function (root) {
    if (!fs.existsSync(root)) {
        console.error('"%s" does\'nt exist.', root);
        process.exit();
    }

    console.log('[DocumentRoot: %s]', root);

    var app = express();
    app.configure(function(){
        app.use(express.static(root));
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