var auto = require('./lib/automato.js');
var log = auto.log;
var renderer = auto.renderer;
auto.user = 'rough'
auto.hosts = ['10.232.132.100', '10.232.132.100'];

function httpdConfNameTransformer(file, host) {
    return 'work/bilanciatori/collaudo/' + host + '/' + file;
}

log.info('deploy avviato');
auto.init();
auto.gitPull(
    'http://rguidi:raffaele@10.238.11.11/gitbucket/git/rguidi/bilanciatori.git', 
    'work/bilanciatori', 
    function (stdout) {
        log.info('repo aggiornato');
        auto.run('mkdir /home/rough/ciccio', null,
            function(){
                log.info('cartelle create, inizio l\'upload');
                auto.upload('httpd.conf', httpdConfNameTransformer, '/home/rough/ciccio/httpd.conf', null, 
                    function() {
                        log.info('upload terminato');
                        var fname = renderer.renderToTmp('test.ejs.sh', {param1: 'ciao'});
                        auto.upload(fname, null, '/home/rough/ciccio/test.sh', null, 
                            function() {
                                auto.run('uname -a', null, function(res) {
                                    log.info('deploy terminato');
                                });
                            }
                        );
                    }
                );
            }
        );
    },
    function(error, stderr){
        log.error('non sono riuscito a clonare il repo');
    }
);