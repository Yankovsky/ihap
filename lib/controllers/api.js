'use strict';

var mongoose = require('mongoose'),
		Museum = mongoose.model('Museum')

exports.museums = function(req, res) {
	return Museum.find(function (err, museums) {
		if (!err) {
			return res.json(museums);
		} else {
			return res.send(err);
		}
	});
};