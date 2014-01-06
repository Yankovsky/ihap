var path = require('path'),
		fs = require('fs')

var modelsPath = path.join(__dirname, '../lib/models')
fs.readdirSync(modelsPath).forEach(function(file) {
	require(modelsPath + '/' + file)
})

var request = require('request')
var cheerio = require('cheerio')
var mongoose = require('mongoose'),
		Museum = mongoose.model('Museum')
mongoose.connect('mongodb://localhost/test');

var _ = require('underscore')

var museums = [],
		pagesCount,
		processedPagesCount = 0

function saveResults() {
	Museum.find({}).remove(function() {
		Museum.create(museums, function(err) {
					console.log('museums spizjeni')

					fs.writeFile(path.join(__dirname, '../lib/db/museums.json'), JSON.stringify(museums), function(err) {
						if (err) {
							console.log(err);
						} else {
							console.log("The file was saved!");
						}
					});

					mongoose.disconnect()
				}
		)
	})
}

function checkIfAllDataObtained() {
	if (processedPagesCount == pagesCount) {
		saveResults()
	}
}

function parsePage(body) {
	$ = cheerio.load(body)
	$('.b-places-list .places-list-item').each(function(i, museum) {
		var $museum = $(this)

		var newMuseum = {
			name: $museum.find('h3 a').text(),
			address: _.last($museum.find('.places-address').text().trim().split('\n')).trim()
		}
		museums.push(newMuseum)
	})
	processedPagesCount++
	checkIfAllDataObtained()
}

var requestAndParsePage = function(link) {
	request(link.attr('href'), function(error, response, body) {
		parsePage(body)
	})
}

function obtainListOfAllMuseumsFromAfisha() {
	request('http://www.afisha.ru/spb/museums/museum_list/exhibitions/', function(error, response, body) {
		$ = cheerio.load(body)
		var pages = $('.page-list').find('li:not(.active-page) a')
		pagesCount = pages.length + 1
		parsePage(body)
		pages.each(function(i, link) {
			requestAndParsePage($(this))
		})
	})
}

obtainListOfAllMuseumsFromAfisha()