'use strict'

var path = require('path'),
		mongoose = require('mongoose'),
		Museum = mongoose.model('Museum')

//Clear old things, then add things in
Museum.find({}).remove(function() {
	Museum.create(require(path.join(__dirname, 'museums.json')))
})