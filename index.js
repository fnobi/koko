var fs        = require('fs'),
    http      = require('http'),
    express   = require('express'),
    emptyPort = require('empty-port'),
    colors    = require('colors');

var Koko = function (root) {
    colors.setTheme({
        info: 'green',
        warn: 'yellow',
        error: 'red'
    });

    if (!fs.existsSync(root)) {
        console.error('%s does\'nt exist.'.error, root);
        process.exit();
    }

    console.log('document root\t: %s'.info, root);

    var app = express();
    app.configure(function(){
        app.use(express.static(root));
    });

    emptyPort({}, function (err, port) {
        if (err) {
            console.error('Error on picking port. Retry.'.error);
            process.exit();
        }

        http.createServer(app).listen(port, function(){
            console.log('listen port\t: %d'.info, port);
        });
    } );
};

module.exports = Koko;