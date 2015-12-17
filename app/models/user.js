var mongoose = require('mongoose');

module.exports = mongoose.model('User',
{
	name: String,
	picture_url: String,
	bio: String,
	password: String,
	login: String
}) 