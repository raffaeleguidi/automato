var ejs = require('ejs');
var log = require('./log.js')
var mysql = require('mysql');
var fs = require('fs')

module.exports = {
	renderSql: function (template, data) {
		var str = fs.readFileSync(__dirname + '/../sql/' + template + '.ejs.sql', 'utf8');
		var res = ejs.render(str, data);
		if (log.level() >= log.DEBUG) {
			log.debug("sql rendering per " + template + " con " + JSON.stringify(data) + ":\n\r" + res);
		}
		return res;	
	},
	execute: function(query, data, callback) {
		var sql = this.renderSql(query, data);	
        var connection = mysql.createConnection({
          host     : 'localhost',
          user     : 'root',
          password : 'root',
          database: 'logmonitor'
        });
	    connection.query(sql, function(err, rows) {
		  	if (err) log.error("error in query " + query + ": " +  err);
		  	log.debug("execute '" + query + "' returned " +  rows.length + " rows");
	    	callback(err, rows);
            connection.end();
	    });
	}
}