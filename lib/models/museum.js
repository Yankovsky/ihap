'use strict';

var mongoose = require('mongoose')
mongoose.model('Museum', new mongoose.Schema({
	name: String,
	address: String,
	workingHours: String,
	url: String,
	imageUrl: String
}))