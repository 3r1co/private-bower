var GitRepoCache = require('./repoCaches/gitRepoCache');
var SvnRepoCache = require('./repoCaches/svnRepoCache');

module.exports = function RepoCacheHandler() {
    var self = {
        start: _start,

        getRepoCache: _getRepoCache,
        getRepoAllCaches: _getRepoAllCaches,
        removePackages: _removePackages,

        shutDown: _shutDown
    };

    var _gitRepoCache;
    var _svnRepoCache;

    var _repoCaches = [];

    function _start(options) {
        self.enabled = true;

        if(options.git) {
            _gitRepoCache = new GitRepoCache(options.git);
            _repoCaches.push(_gitRepoCache);
        }

        if(options.svn) {
            _svnRepoCache = new SvnRepoCache(options.svn);
            _repoCaches.push(_svnRepoCache);
        }
    }

    function _getRepoCache(repoUrl) {
        if(repoUrl.indexOf('svn+') !== -1) {
            return _svnRepoCache;
        }

        return _gitRepoCache;
    }

    function _getRepoAllCaches() {
        return _repoCaches;
    }

    function _shutDown() {
        _repoCaches.forEach(function(repoCache) {
            repoCache.shutDown();
        });
    }

    function _removePackages(packageNames) {
        _repoCaches.forEach(function(repoCache) {
            packageNames.forEach(function(packageName) {
                repoCache.removeRepo(packageName);
            });
        });
    }

    return self;
}();