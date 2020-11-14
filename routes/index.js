var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var nodeDataSchema = new Schema({
  node: {type: String, required: true}, 
  temperature: {type: String, required: true},
  humidity: {type: String, required: true},
  mq2: {type: String, required: true},
  mq9: {type: String, required: true},
  flame: {type: String, required: true},
  date: { type: String}
}, {collection: 'nodeData'});

var nodeData = mongoose.model('nodeData', nodeDataSchema);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Fire prevention - UFPS' });
});

router.get('/data', function (req, res, next){
	var io = req.app.get('socketio');
	var d = new Date();
	var data = {
		node: req.query.node,
		temperature: req.query.temp,
		humidity : req.query.hum,
		mq2 : req.query.mq2,
		mq9 : req.query.mq9,
		flame : req.query.flame,
		date : d.toLocaleString()
	};
	
	var dbdata = new nodeData(data);
    dbdata.save();
	io.emit("sensor node", data);
	res.sendStatus(200);
});

router.get('/account', function(req, res, next){
	res.render('account', {title: 'Account', data: 'Jhon2295'});
});

module.exports = router;
