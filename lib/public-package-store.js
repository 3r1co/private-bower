var http = require('http');
var logger = require('./logger');

var publicBowerUrl = 'http://bower.herokuapp.com/packages/';

var _config;

module.exports = function PublicPackageStore(config) {
    var _packages = {};
    _config = config;
    _init();
    function _init() {
        logger.log('Refreshing public packages...');

        _loadPublicPackages();
    }

    function _getPackage(packageName) {
        return _packages[packageName];
    }

    function _loadPublicPackages() {

        var options;
        if (_config.proxySettings.enabled) {
            console.log( 'proxy')
            //var auth = 'Basic ' + new Buffer(_config.proxySettings.username + ':' + _config.proxySettings.password).toString('base64');
            options = {
                host: _config.proxySettings.host,
                port: _config.proxySettings.port,
                path: publicBowerUrl
//                auth: auth,
//                headers: {
//                    'Proxy-Authorization': auth,
//                    'Authorization': auth,
//                    host: publicBowerUrl
//                }
            };
        } else {
            options = publicBowerUrl;
        }

        http.get(options, function(response) {
            console.log('dresponse ' +response.request)
            var body = '';

            response.on('data', function(chunk) {
                console.log('ddd ' +chunk)
                body += chunk;
            });

            response.on('end', function() {
                processData(body);
            });
        });

        setTimeout(_loadPublicPackages, 1000 * 60 * 30);

        function processData(data) {
            if(data.indexOf('Not Found')!== -1) {
                return;
            }

            var jsonData = JSON.parse(data);

            for(var i = 0, len = jsonData.length; i < len; i++) {
                var item = jsonData[i];

                _packages[item.name] = item;
            }

            logger.log('Loaded public packages');
        }
    }

    function _searchPackage(name) {
        var searchName = name.toLowerCase();
        var packages = [];

        for(var packageName in _packages) {
            if(_packages.hasOwnProperty(packageName) &&
                packageName.toLowerCase().indexOf(searchName) !== -1) {

                var item = _packages[packageName];
                packages.push({
                    name: item.name,
                    url: item.repo
                });
            }
        }

        return packages;
    }

    return {
        getPackage: _getPackage,
        searchPackage: _searchPackage
    };
};