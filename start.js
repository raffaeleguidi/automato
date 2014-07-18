var log = require('./utils/log.js');
var auto = require('./lib/automato.js');

auto.user = 'rough'
auto.hosts = ['10.232.132.100', '10.232.132.100'];

function deploy(stdout) {
    auto.run('uname -a', function(res) {
        log.info('deploy effettuato su ' + res.host);
        log.trace(res.stdout);
    });
}

auto.gitPull(
    'http://rguidi:raffaele@10.238.11.11/gitbucket/git/rguidi/bilanciatori.git', 
    'work/bilanciatori', 
    deploy,
    function(error, stderr){
        log.error('non sono riuscito a clonare il repo');
    }
);