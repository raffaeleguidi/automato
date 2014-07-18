var dfl = require("date-format-lite");

module.exports = {
	ERROR: 1,
	WARN: 2,
	INFO: 3,
	TRACE: 4,
	DEBUG: 5,
	level: function () {return this.INFO},
	write: function (levelId, level, what) {
        if (levelId <= this.level()) {
		  console.log(new Date().format("YYYY-MM-DD hh:mm:ss") + " [" + level + "] " + what);
        } else {
		  //console.log(new Date().format("YYYY-MM-DD hh:mm:ss") + " [!!!!!!!!!!!!" + level + "] " + what);
        }
	},
	info: function (what) {
		this.write(this.INFO, "INFO ", what);
	},
	warn: function (what) {
		this.write(this.WARN, "WARN ", what);
	},
	debug: function (what) {
		this.write(this.DEBUG, "DEBUG", what);
	},
	trace: function (what) {
		this.write(this.TRACE, "TRACE", what);
	},
	error: function (what) {
		this.write(this.ERROR, "ERROR", what);
	}
}