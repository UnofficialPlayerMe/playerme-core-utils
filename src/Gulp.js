var GulpUtilClass = function(){};
var gulpUtil = new GulpUtilClass();

/**
 * Pass in the 'karma' module
 * @param karmaModule
 * @returns {boolean} Module added
 */
gulpUtil.setupKarma = function(karmaModule){
    if (karmaModule && karmaModule.Server){
        this._karma = karmaModule;
    }
    return this._karma ? true : false;
};

/**
 * Pass in the 'node-notifier' module
 * @param notifierModule
 * @returns {boolean} Module added
 */
gulpUtil.setupNotifier = function(notifierModule){
    if (notifierModule && notifierModule.notify){
        this._notifier = notifierModule;
    }
    return this._notifier ? true : false;
};

/**
 * Show a native notification on Mac, Windows, Linux.
 * Falls back onto Grown or Growl for Windows.
 * @param {String} message The message to show
 * @param {String} [title] The title of the notification
 * @param {String} [icon]  The path to an icon to show
 */
gulpUtil.notify = function(message, title, icon){
    var self = gulpUtil;
    if (!self._notifier) throw "setupNotifier() must be called before running notify()";

    self._notifier.notify({
        title:   title   || '',
        message: message || '',
        icon:    icon    || '',
        sound:   false,
        wait:    false // Wait with callback, until user action is taken against notification
    });
};

/**
 * Run Karma tests
 * @param {Function} callback Function to call upon completion
 * @param {Boolean} [singleRun=false] Whether the Karma server should shut down after one run
 * @param {String} [configFile='/.karma.conf.js'] The location of the karma config file
 * @returns {*} The Karma server
 */
gulpUtil.runKarma = function(callback, singleRun, configFile){
    var self = gulpUtil;
    var path = require('path');
    var cwd = process.cwd();

    if (!self._karma) throw "setupKarma() must be called before running runKarma()";
    if (!self._notifier) throw "setupNotifier() must be called before running runKarma()";

    if (!callback) throw "runKarma wasn't passed a callback";
    if (!configFile) configFile = path.join(cwd, 'karma.conf.js');

    var karmaServer = new self._karma.Server({
        configFile: configFile,
        singleRun: singleRun
    }, callback);

    var karmaIcon = path.join(cwd, 'node_modules', 'karma/static', 'favicon.ico');

    // karmaServer.on('browser_register', function (browser)           { console.log('browser_register', { browser: browser                   }); });
    // karmaServer.on('browser_error',    function (browser, error)    { console.log('browser_error',    { browser: browser,  error: error    }); });
    // karmaServer.on('browser_start',    function (browser, info)     { console.log('browser_start',    { browser: browser,  info:  info     }); });
    // karmaServer.on('browser_complete', function (browser, result)   { console.log('browser_complete', { browser: browser,  result:result   }); });
    // karmaServer.on('browsers_change',  function (browsers)          { console.log('browsers_change',  { browsers:browsers                  }); });
    // karmaServer.on('run_start',        function (browsers)          { console.log('run_start',        { browsers:browsers                  }); });
    // karmaServer.on('run_complete',     function (browsers, results) { console.log('run_complete',     { browsers:browsers, results:results }); });

    if (singleRun) {
        karmaServer.on('run_start', function (browsers) {
            self.notify("Running...", "Karma", karmaIcon);
        });
    }
    karmaServer.on('run_complete', function (browsers, results) {
        var numSuccess   = results.success;
        var numFailed    = results.failed;
        var numTotal     = numSuccess + numFailed;
        var error        = results.error;
        var disconnected = results.disconnected;
        var exitCode     = results.exitCode;

        if (error)        return self.notify("Error", "Karma", karmaIcon);
        if (disconnected) return self.notify("Disconnected", "Karma", karmaIcon);
        if (numFailed)    return self.notify("Failed "+numFailed+"/"+numTotal, "Karma", karmaIcon);
        if (numSuccess)   return self.notify("Success "+numSuccess+"/"+numTotal, "Karma", karmaIcon);
        if (!numTotal)    return self.notify("No tests ran", "Karma", karmaIcon);
        return self.notify("Unhandled ending with exit code "+exitCode, "Karma", karmaIcon);
    });

    karmaServer.start();
    return karmaServer;
};

// Export the instance
module.exports = gulpUtil;
