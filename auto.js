#!/usr/bin/env node

var program = require('commander');
var log = require('./lib/utils/log.js');

program
  .version('0.0.1')
  .option('-r, --remote [host]', 'remote hostname or ip')
  .option('-u, --user [user]', 'remote user name')
  .option('-x, --execute [command]', 'execute the given command')
  .option('-l, --upload [file]', 'upload the given file')
  .option('-d, --download [file]', 'download the given file')
  .option('-f, --file [filename and path]', 'file name and path')
  .option('-t, --template [template filename]', 'template filename and path')
  .option('-m, --model [model filename(.json)]', 'json model file name')
  .option('-im, --inlinemodel [inline model in json format]', 'inline json model')
  .parse(process.argv);

log.info('*** automato starting ***');
if (program.remote)     log.info('host: ' + program.remote);
if (program.user)       log.info('user: ' + program.user);
if (program.upload)     log.info('upload: ' + program.upload);
if (program.download)   log.info('download: ' + program.download);
if (program.execute)    log.info('execute command: ' + program.execute);
if (program.remote)     log.info('remote host: ' + program.remote);
if (program.file)       log.info('filename: ' + program.file);
if (program.template)   log.info('template: ' + program.template);
if (program.model)      log.info('model: ' + program.model);

var auto = require('./lib/automato-lib.js').init();

if (program.execute) {
    auto.run(program.remote, program.user, program.execute, function(res) {
        log.trace("response is: " + JSON.stringify(res));
        console.log(res.stdout);
    });
} else if (program.upload) {
    auto.upload(program.remote, program.user, program.upload, program.file, function(res) {
        log.trace("response is: " + JSON.stringify(res));
        console.log(res.stdout);
    });
} else if (program.download) {
    auto.download(program.remote, program.user, program.download, program.file, function(res) {
        log.trace("response is: " + JSON.stringify(res));
    });
} else if (program.template) {
    var fs = require('fs');
    var model = "";

    if(program.model) 
    {
      model = require(program.model);
      log.trace("Found a model :" + model);
    }
    else if(program.inlinemodel) 
    {
      model = JSON.parse(program.inlinemodel);
      log.info("Found an INLINE model :" + JSON.stringify(model));
    }

    log.trace("Found a model :" + model);

    fs.writeFileSync(program.file, auto.render(program.template, model));
}

log.info('*** automato done ***');
