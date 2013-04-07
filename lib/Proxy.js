var url       = require('url'),
    httpProxy = require('http-proxy');

var Proxy = function (proxyURL) {
    if (!proxyURL.match(/^https?:\/\//)) {
        proxyURL = 'http://' + proxyURL;
    }

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

Proxy.prototype.proxyRequest = function (req, res) {
    var host  = this.host;
    var proxy = this.proxy;

    // そのままだと、Host headerがKokoのurlになってしまうので、上書きする
    req.headers.host = host;

    proxy.proxyRequest(req, res);
};

module.exports = Proxy;