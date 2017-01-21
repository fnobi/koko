var fs            = require('fs'),
    path          = require('path'),
    util          = require('util'),
    async         = require('async'),
    http          = require('http'),
    express       = require('express'),
    emptyPort     = require('empty-port'),
    colors        = require('colors'),
    opn           = require('opn'),

    Proxy         = require('./lib/Proxy'),
    localIP       = require('./lib/localIP'),

    phpExpress = require('php-express')(),
    marked = require('marked');

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
    this.staticPort = opt.staticPort;
    this.usePHP = opt.usePHP;
    this.useMarkdown = opt.useMarkdown;
    this.htmlHandler = opt.htmlHandler;
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

    console.log('php\t: %s'.info, this.usePHP ? 'on' : 'off');
    console.log('md\t: %s'.info, this.useMarkdown ? 'on' : 'off');

    app.configure(function(){
        app.use(express.bodyParser());

        if (this.usePHP) {
            app.set('views', this.root);
            app.engine('php', phpExpress.engine);
            app.set('view engine', 'php');

            app.use(app.router);
        }

        if (this.useMarkdown) {
            app.use(function (req, res, next) {
                if (! /\.md$/.test(req.url)) {
                    next();
                    return;
                }
                this.renderMarkdown(req, res);
            }.bind(this));
        }

        if (this.htmlHandler) {
            app.use(function (req, res, next) {
                if (! /\.html$/.test(req.url)) {
                    next();
                    return;
                }
                this.handleHtmlWithCustomHandler(req, res);
            }.bind(this));
        }

        app.use(express.static(this.root));
        app.use(express.directory(this.root));

        app.use(function (req, res, next) {
            if (!proxy) {
                return next();
            }
            proxy.proxyRequest(req, res);
        });
    }.bind(this));

    if (this.usePHP) {
        app.all(/.+\.php$/, phpExpress.router);
    }

    async.waterfall([
        emptyPort.bind(this, {}),
        function (p, next) {
            this.port = this.staticPort || p;

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
    opn(openURL).then(callback);

};

Koko.prototype.renderMarkdown = function (req, res) {
    var rel = req.url.slice(1);
    var filePath = path.join(this.root, rel);                
    fs.readFile(filePath, 'utf8', function (err, body) {
        res.end(marked(body));
    });
};

Koko.prototype.handleHtmlWithCustomHandler = function (req, res) {
    var rel = req.url.slice(1);
    var filePath = path.join(this.root, rel);
    var htmlHandler = this.htmlHandler;
    fs.readFile(filePath, 'utf8', function (err, body) {
        res.end(htmlHandler(body));
    });
};

module.exports = Koko;
