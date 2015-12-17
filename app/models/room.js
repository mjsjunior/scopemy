
var mongoose = require('mongoose');

module.exports = mongoose.model('Room',
{
	"title": String,
	"location": {
	    "type": { 
	      type: String,
	      default: 'Point'
	    }, 
	    coordinates: [Number]
	  }
})



// var sala = {
// 	"title": "Sala minha casa"
// 	"location" : {"type":"Point","coordinates":[-21.22725,-43.76797]}
// } 