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
	totalMuseums = 0,
	pagesCount,
	processedPagesCount = 0,
	processedMuseumsCount = 0

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


function requestAndParsePage(link) {
	request(link.attr('href'), function(error, response, body) {
		parsePage(body)
	})
}

function parsePage(body) {
	$ = cheerio.load(body)
	var $museums = $('.b-places-list .places-list-item')
	totalMuseums += $museums.length
	$museums.each(function(index) {
		var $museum = $(this)
		requestAndParseMuseum($museum.find('h3 a').attr('href'), _.last($museum.find('.places-address').text().trim().split('\n')).trim())
	})
	processedPagesCount++
}

function getWorkingHours(info) {
	var workingHours = info.match('Режим работы: (.*)')
	if (workingHours) 
		return workingHours[1]
	else {
		return 'Временно закрыт'
	}
}
function requestAndParseMuseum(link, address) {
	request(link, function(error, response, body) {
		$ = cheerio.load(body)
		var $museum = $('#content'),
			$summary = $('.b-object-summary .m-margin-btm')

		var newMuseum = {
			name: $museum.find('.b-object-header h1').text().trim(),
			address: address,
			workingHours: getWorkingHours($summary.text()),
			url: $summary.find('noindex a').attr('href'),
			imageUrl: $museum.find('#ctl00_CenterPlaceHolder_ucMainPageContent_imgMainPhotoHL').attr('src')
		}

		museums.push(newMuseum)
		processedMuseumsCount++
		checkIfAllDataObtained()
	})
}

function checkIfAllDataObtained() {
	if (processedPagesCount == pagesCount && processedMuseumsCount == totalMuseums) {
		saveResults()
	}
}

function saveResults() {
	Museum.find({}).remove(function() {
		Museum.create(museums, function(err) {
			fs.writeFile(path.join(__dirname, '../lib/db/museums.json'), JSON.stringify(museums), function(err) {
				if (err) {
					console.log(err);
				} else {
					console.log("The file was saved!");
				}
			});

			mongoose.disconnect()
		})
	})
}

obtainListOfAllMuseumsFromAfisha()