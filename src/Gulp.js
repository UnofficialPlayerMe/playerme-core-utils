function Gulp(){
    this._notifier = require('node-notifier');
    this._karma = require('karma');
}

/**
 * Show a native notification on Mac, Windows, Linux.
 * Falls back onto Grown or Growl for Windows.
 * @param {String} message The message to show
 * @param {String} [title] The title of the notification
 * @param {String} [icon]  The path to an icon to show
 */
Gulp.prototype.notify = function(message, title, icon){
    this._notifier.notify({
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
 * @param {String} [configFile='./karma.conf.js'] The location of the karma config file
 * @returns {karma.Server} The Karma server
 */
Gulp.prototype.runKarma = function(callback, singleRun, configFile){
    if (!callback) throw "runKarma wasn't passed a callback";
    if (!configFile) configFile = './karma.conf.js';
//  if (!configFile) configFile = __dirname + '/karma.conf.js';

    var karmaServer = new this._karma.Server({
        configFile: configFile,
        singleRun: singleRun
    }, callback);

    // karmaServer.on('browser_register', function (browser)           { console.log('browser_register', { browser: browser                   }); });
    // karmaServer.on('browser_error',    function (browser, error)    { console.log('browser_error',    { browser: browser,  error: error    }); });
    // karmaServer.on('browser_start',    function (browser, info)     { console.log('browser_start',    { browser: browser,  info:  info     }); });
    // karmaServer.on('browser_complete', function (browser, result)   { console.log('browser_complete', { browser: browser,  result:result   }); });
    // karmaServer.on('browsers_change',  function (browsers)          { console.log('browsers_change',  { browsers:browsers                  }); });
    // karmaServer.on('run_start',        function (browsers)          { console.log('run_start',        { browsers:browsers                  }); });
    // karmaServer.on('run_complete',     function (browsers, results) { console.log('run_complete',     { browsers:browsers, results:results }); });

    var path = require('path');
    var karmaIcon = path.join(__dirname, 'node_modules', 'karma/static', 'favicon.ico');

    if (singleRun) {
        karmaServer.on('run_start', function (browsers) {
            notify("Running...", "Karma", karmaIcon);
        });
    }
    karmaServer.on('run_complete', function (browsers, results) {
        var numSuccess   = results.success;
        var numFailed    = results.failed;
        var numTotal     = numSuccess + numFailed;
        var error        = results.error;
        var disconnected = results.disconnected;
        var exitCode     = results.exitCode;

        if (error)        return notify("Error", "Karma", karmaIcon);
        if (disconnected) return notify("Disconnected", "Karma", karmaIcon);
        if (numFailed)    return notify("Failed "+numFailed+"/"+numTotal, "Karma", karmaIcon);
        if (numSuccess)   return notify("Success "+numSuccess+"/"+numTotal, "Karma", karmaIcon);
        if (!numTotal)    return notify("No tests ran", "Karma", karmaIcon);
        return notify("Unhandled ending with exit code "+exitCode, "Karma", karmaIcon);
    });

    karmaServer.start();
    return karmaServer;
};

// Export an instance
module.exports = new Gulp();