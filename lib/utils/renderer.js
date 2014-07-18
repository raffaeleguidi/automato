var ejs = require('ejs');
var log = require('./log.js')
var fs = require('fs')
var randomstring = require("randomstring");

module.exports = {
	init: function () {
        if (!fs.existsSync("tmp"))
            fs.mkdirSync("tmp");
	},
	render: function (template, data) {
		//var str = fs.readFileSync(__dirname + '/../templates/' + template, 'utf8');
		var str = fs.readFileSync(template, 'utf8');
		var res = ejs.render(str, data);
		if (log.level() >= log.DEBUG) {
			log.debug("rendering of " + template + " with " + JSON.stringify(data) + ":\n\r" + res);
		}
		return res;	
	},
    renderToTmp: function(template, params) {
        var fname = "tmp/" + randomstring.generate(15);
        fd = fs.openSync(fname, 'a');
        fs.writeSync(fd, this.render(template, params));
        fs.closeSync(fd);
        log.trace("created " + fname);
        return fname;
    }, 
    deleteTmp: function(fname) {
        fs.unlinkSync(fname);
        log.trace("deleted " + fname);
    }
}