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
    this.autoOpen = opt.autoOpen;

    this.start();
};

Koko.prototype.start = function () {
    var self     = this;
    var autoOpen = this.autoOpen;

    this.startServer(function (err) {
        if (err) {
            console.error((err + '').error);
            process.exit();
        }

        if (!autoOpen) {
            return;
        }

        self.open(autoOpen);
    });
};

Koko.prototype.startServer = function (callback) {
    var self     = this;
    var root     = this.root;
    var proxyURL = this.proxyURL;

    var port, proxy;

    var app  = express();

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

        http.createServer(app).listen(port, next);

    }, function (next) {
        console.log('[listen %d]'.info, port);

        self.port = port;

        next();
    }], callback);
};

Koko.prototype.open = function (openPath, callback) {
    callback = callback || function () {};

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

    // そのままだと、Host headerがKokoのurlになってしまうので、上書きする
    req.headers.host = host;

    proxy.proxyRequest(req, res);
};

module.exports = Koko;