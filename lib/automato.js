var SSH = require('node-sshclient/lib/ssh');
var SCP = require('node-sshclient/lib/scp');
var log = require('../utils/log.js');
var sys = require('sys')
var exec = require('child_process').exec;

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
    scp.upload(file, remote, function(procResult) {
	    log.trace('exit code: ' + procResult.exitCode + ' uploading ' + file + ' to ' + host);
        procResult.host = host;
        procResult.user = user;
        callback(procResult);
    });
}

function download(host, user, remoteFile, localDir, callback) {
    var scp = setupSCP(host, user)
    scp.download(remoteFile, localDir, function(procResult) {
	    log.trace('exit code: ' + procResult.exitCode + ' downloading ' + remoteFile + ' from ' + host);
        procResult.host = host;
        procResult.user = user;
        callback(procResult);
        console.log(procResult.exitCode);
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
    ssh.command(command, '', function(procResult) {
        log.trace('executing ' + command + ' as user ' + user + ' on ' + host);
        log.trace(procResult.stderr);
        log.trace(procResult.stdout);
        procResult.host = host;
        procResult.user = user;
        callback(procResult);
        log.trace('done executing ' + command + ' as user ' + user + ' on ' + host);
    });
}

module.exports = {
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
            upload(host, user, transformer(file, host), remote, function(procResult) {
                if (callback) callback(procResult);
                done = done + 1;
            });
        });
        waitForIt();
        if (allDoneCallback) allDoneCallback();
	},
    download: function (remoteFile, localDir, callback) {
        var user = this.user;
        this.hosts.forEach(function(host){
            download(host, user, remoteFile, localDir, callback);
        });
	},
    uploadSingle: upload,
    downloadSingle: download,
    local: function (command, options, callback) {
        exec(command, options, callback);
	},
    runSingle: function (host, user, command, callback) {
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
            run(host, user, command, function(procResult) {
                if (callback) callback(procResult);
                done = done + 1;
            });
        });
        if (allDoneCallback) allDoneCallback();
   }
}