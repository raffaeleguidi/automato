var SSH = require('node-sshclient/lib/ssh');
var SCP = require('node-sshclient/lib/scp');
var log = require('./utils/log.js');
var sys = require('sys')
var exec = require('child_process').exec;
var renderer = require('./utils/renderer.js');

function setupSSH(host, user) {
	log.trace('configuring ssh');
	var ssh = new SSH({
		hostname: host
	    , user: user
	    , port: 22
		, option: {
			ConnectTimeout: 2
		}
	});
    return ssh;
}

function setupSCP(host, user){
	log.trace('configuring scp');
    var scp = new SCP({
        hostname: host
        , user: user
    });
    return scp;
}

function defaultFilenameTransformer(file, host) {
    return file;
}

function upload(host, user, file, remote, callback) {
    var scp = setupSCP(host, user)
    scp.upload(file, remote, function(res) {
	    log.trace('exit code: ' + res.exitCode + ' uploading ' + file + ' to ' + host);
        res.host = host;
        res.user = user;
        callback(res);
    });
}

function download(host, user, remoteFile, localDir, callback) {
    var scp = setupSCP(host, user)
    scp.download(remoteFile, localDir, function(res) {
	    log.trace('exit code: ' + res.exitCode + ' downloading ' + remoteFile + ' from ' + host);
        res.host = host;
        res.user = user;
        callback(res);
        console.log(res.exitCode);
    });
}

function gitPull(auto, remote, workingDir, callback, errorCallback) {
    auto.local('git clone ' + remote +  ' ' + workingDir, null ,function(error, stdout, stderr){
        log.trace('trying to clone repo');
        if (stderr) {
            log.trace('folder already exists: updating');
            auto.local('git pull', { cwd: workingDir} , function(error, stdout, stderr){
                if (stderr) {
                    log.error('error updating repo');
                    log.error(stderr);
                    errorCallback(error, stderr);
                } else {
                    log.trace('repo updated');
                    callback(stdout);
                }
            });
        } else {
            callback(stdout);               
        }
    });
}

function run(host, user, command, callback) {
    var ssh = setupSSH(host, user)
    ssh.command(command, '', function(res) {
        log.trace('executing ' + command + ' as user ' + user + ' on ' + host);
        log.trace(res.stderr);
        log.trace(res.stdout);
        res.host = host;
        res.user = user;
        callback(res);
        log.trace('done executing ' + command + ' as user ' + user + ' on ' + host);
    });
}

module.exports = {
    init: function() {
        renderer.init();
    },
    gitPull: function(remote, workingDir, callback, errorCallback) {
        gitPull(this, remote, workingDir, callback, errorCallback);
    },
    upload: function (file, transformer, remote, callback, allDoneCallback) {
        var user = this.user;
        var hosts = this.hosts;
        function waitForIt() {
            if (done < hosts.length) {
                setTimeout(waitForIt, 1000);
            }
        }
        var done = 0;
        if (transformer == null) transformer = defaultFilenameTransformer
        this.hosts.forEach(function(host){
            upload(host, user, transformer(file, host), remote, function(res) {
                if (callback) callback(res);
                done = done + 1;
            });
        });
        waitForIt();
        if (allDoneCallback) allDoneCallback();
	},
    download: function (remoteFile, localDir, callback, allDoneCallback) {
        var user = this.user;
        var hosts = this.hosts;
        function waitForIt() {
            if (done < hosts.length) {
                setTimeout(waitForIt, 1000);
            }
        }
        var done = 0;
        this.hosts.forEach(function(host){
            download(host, user, remoteFile, localDir, function(res) {
                if (callback) callback(res);
                done = done + 1;
            });
        });
        waitForIt();
        if (allDoneCallback) allDoneCallback();
	},
    uploadToASingleHost: upload,
    downloadFromASingleHost: download,
    local: function (command, options, callback) {
        exec(command, options, callback);
	},
    runOnASingleHost: function (host, user, command, callback) {
        run(host, user, command, callback);
	},
    run: function (command, callback, allDoneCallback) {
        var user = this.user;
        var hosts = this.hosts;
        function waitForIt() {
            if (done < hosts.length) {
                setTimeout(waitForIt, 1000);
            }
        }
        var done = 0;
        this.hosts.forEach(function(host){
            run(host, user, command, function(res) {
                if (callback) callback(res);
                done = done + 1;
            });
        });
        if (allDoneCallback) allDoneCallback();
   },
   log: log,
   renderer: renderer,
   render: function(template, data) {
       return renderer.render(template, data);
   }
}