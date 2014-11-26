#!/usr/bin/env node

var program = require('commander');

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
  .parse(process.argv);

console.log('you executed:');
if (program.remote) console.log('host: ' + program.remote);
if (program.user) console.log('user: ' + program.user);
if (program.upload) console.log('upload: ' + program.upload);
if (program.download) console.log('download: ' + program.download);
if (program.execute) console.log('execute command: ' + program.execute);
if (program.remote) console.log('remote host: ' + program.remote);
if (program.file) console.log('filename: ' + program.file);
if (program.template) console.log('template: ' + program.template);
if (program.model) console.log('model: ' + program.model);

//var auto = require('./lib/automato-lib.js').init();
//
//auto.run('ponte', 'rough', 'uname -a', function(res) {
//    console.log(JSON.stringify(res));
//    console.log(res.stdout);
//})
//
//console.log(auto.render('test.ejs.sh', {param1: 'ciao'}));
//console.log(auto.renderToTmp('test.ejs.sh', {param1: 'ciao'}));
