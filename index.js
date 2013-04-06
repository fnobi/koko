var fs            = require('fs'),
    async         = require('async'),
    url           = require('url'),
    http          = require('http'),
    express       = require('express'),
    emptyPort     = require('empty-port'),
    httpProxy     = require('http-proxy'),
    colors        = require('colors'),
    child_process = require('child_process');

var Koko = function (root, opt) {
    var self = this;
    var app  = express();

    var proxyURL = opt.proxyURL;
    var autoOpen = opt.autoOpen;

    var port, proxy;

    colors.setTheme({
        info  : 'green',
        warn  : 'yellow',
        error : 'red'
    });

    if (!fs.existsSync(root)) {
        console.error('%s does\'nt exist.'.error, root);
        process.exit();
    }

    console.log('document root\t: %s'.info, root);

    if (proxyURL) {
        proxy = new Koko.Proxy(proxyURL);
        console.log('proxy\t: %s:%d'.info, proxy.host, proxy.port);
    }

    app.configure(function(){
        app.use(express.static(root));
        app.use(function (req, res, next) {
            if (!proxy) {
                return next();
            }
            proxy.proxyRequest(req, res);
        });
    });

    async.waterfall([function (next) {
        emptyPort({}, next);
    }, function (p, next) {
        port = p;
        self.port = port;

        http.createServer(app).listen(port, next);

    }, function (next) {
        console.log('[listen %d]'.info, port);

        if (!autoOpen) {
            return next();
        }

        self.open(autoOpen, next);

    }], function (err) {
            if (err) {
                console.error((err + '').error);
                process.exit();
            }
    });
};

Koko.prototype.open = function (openPath, callback) {
    var port = this.port;

    var openURL = [
        'http://localhost:' + port,
        openPath.replace ? openPath.replace(/^\//, '') : ''
    ].join('/');

    console.log('[open %s]'.info, openURL);
    child_process.exec('open ' + openURL, callback);
};

Koko.Proxy = function (proxyURL) {
    var host = url.parse(proxyURL).hostname || 'localhost';
    var port = url.parse(proxyURL).port     || 80;

    var proxy = new httpProxy.HttpProxy({
        target: {
            host: host,
            port: port
        }
    });

    this.url = proxyURL;

    this.host = host;
    this.port = port;
    this.proxy = proxy;
};

Koko.Proxy.prototype.proxyRequest = function (req, res) {
    var host  = this.host;
    var proxy = this.proxy;

    req.headers.host = host;
    proxy.proxyRequest(req, res);
};

module.exports = Koko;