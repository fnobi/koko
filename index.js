var fs            = require('fs'),
    async         = require('async'),
    http          = require('http'),
    express       = require('express'),
    emptyPort     = require('empty-port'),
    colors        = require('colors'),
    child_process = require('child_process'),

    Proxy         = require('./lib/Proxy'),
    localIP       = require('./lib/localIP');

var Koko = function (root, opt) {
    colors.setTheme({
        info  : 'green',
        warn  : 'yellow',
        error : 'red'
    });

    if (!fs.existsSync(root)) {
        console.error('%s does\'nt exist.'.error, root);
        return;
    }
    console.log('document root\t: %s'.info, root);

    this.root     = root;
    this.proxyURL = opt.proxyURL;
    this.openPath = opt.openPath;
};

Koko.prototype.start = function () {
    this.startServer(function (err) {
        if (err) {
            console.error((err + '').error);
            process.exit();
        }

        if (!this.openPath) {
            return;
        }

        this.open();
    }.bind(this));
};

Koko.prototype.startServer = function (callback) {
    var proxyURL = this.proxyURL;
    var proxy;

    var app  = express();

    if (proxyURL) {
        proxy = new Proxy(proxyURL);
        console.log('proxy\t: %s:%d'.info, proxy.host, proxy.port);
    }

    app.configure(function(){
        app.use(express.static(this.root));
        app.use(function (req, res, next) {
            if (!proxy) {
                return next();
            }
            proxy.proxyRequest(req, res);
        });
    }.bind(this));

    async.waterfall([
        emptyPort.bind(this, {}),
        function (p, next) {
            this.port = p;

            http.createServer(app).listen(this.port, next);

        }.bind(this),
        function (next) {
            console.log('[listen %d]'.info, this.port);

            next();
        }.bind(this)
    ], callback);
};

Koko.prototype.open = function (callback) {
    callback = callback || function () {};

    var openPath = this.openPath;

    var host = localIP()[0] || '127.0.0.1';
    var port = this.port;

    var openURL = [
        'http://' + host + ':' + port,
        openPath.replace ? openPath.replace(/^\//, '') : ''
    ].join('/');

    console.log('[open %s]'.info, openURL);
    child_process.exec('open ' + openURL, callback);
};

module.exports = Koko;