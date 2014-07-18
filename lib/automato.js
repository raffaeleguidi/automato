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
}

function upload(host, user, file, remoteDir, callback) {
    var scp = setupSCP(host, user)
    scp.upload(file, remoteDir, function(procResult) {
	    log.trace('exit code: ' + procResult.exitCode + ' uploading ' + file + ' to ' + host);
        procResult.host = host;
        procResult.user = user;
        callback(procResult);
        console.log(procResult.exitCode);
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
        log.info('provo a clonare il repo');
        if (stderr) {
            log.info('il repo esiste già: lo aggiorno');
            auto.local('git pull', { cwd: 'work/bilanciatori'} , function(error, stdout, stderr){
                if (stderr) {
                    log.info('l\'aggiornamento non è stato eseguito');
                    log.error(stderr);
                    errorCallback(error, stderr);
                } else {
                    log.info('aggiornamento eseguito');
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
    upload: function (file, remoteDir, callback) {
        var user = this.user;
        this.hosts.forEach(function(host){
            upload(host, user, file, remoteDir, callback);
        });
	},
    download: function (remoteFile, localDir, callback) {
        var user = this.user;
        this.hosts.forEach(function(host){
            download(host, user, remoteFile, localDir, callback);
        });
	},
    local: function (command, options, callback) {
        exec(command, options, callback);
	},
    runSingle: function (host, user, command, callback) {
        run(host, user, command, callback);
	},
    run: function (command, callback) {
        var user = this.user;
        this.hosts.forEach(function(host){
            run(host, user, command, callback);
        });
    }
}