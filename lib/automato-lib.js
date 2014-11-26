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
        return this;
    },
//    upload: function (file, transformer, remote, callback, allDoneCallback) {
//        var user = this.user;
//        var hosts = this.hosts;
//        function waitForIt() {
//            if (done < hosts.length) {
//                setTimeout(waitForIt, 1000);
//            }
//        }
//        var done = 0;
//        if (transformer == null) transformer = defaultFilenameTransformer
//        this.hosts.forEach(function(host){
//            upload(host, user, transformer(file, host), remote, function(res) {
//                if (callback) callback(res);
//                done = done + 1;
//            });
//        });
//        waitForIt();
//        if (allDoneCallback) allDoneCallback();
//	},
//    download: function (remoteFile, localDir, callback, allDoneCallback) {
//        var user = this.user;
//        var hosts = this.hosts;
//        function waitForIt() {
//            if (done < hosts.length) {
//                setTimeout(waitForIt, 1000);
//            }
//        }
//        var done = 0;
//        this.hosts.forEach(function(host){
//            download(host, user, remoteFile, localDir, function(res) {
//                if (callback) callback(res);
//                done = done + 1;
//            });
//        });
//        waitForIt();
//        if (allDoneCallback) allDoneCallback();
//	},
    upload: upload,
    downlad: download,
    local: function (command, options, callback) {
        exec(command, options, callback);
	},
    run: run,
    render: renderer.render,
    renderToTmp: renderer.renderToTmp
}
