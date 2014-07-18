var day = 1000*60*60*24;
var hour= 1000*60*60;

module.exports = {

    filter: function(req) {
        var filter = {};
        var today = new Date();
        if (today.getHours() < 8) {
            today = today = new Date(today.getTime + hour*24);
        }
        filter.startFrom = req.query.startFrom != null ? req.query.startFrom : today.format("YYYY/MM/DD");
        filter.endTo = req.query.endTo != null ? req.query.endTo : new Date(new Date(filter.startFrom).getTime()+hour*24).format("YYYY/MM/DD");
        filter.ss = req.query.ss != null ? req.query.ss : "" ;
        filter.orderBy = req.query.orderBy != null ? req.query.orderBy : "errors" ;
        return filter;
    }

}