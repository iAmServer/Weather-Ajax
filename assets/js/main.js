(function ($) {

	"use strict";

	var fullHeight = function () {

		$('.js-fullheight').css('height', $(window).height());
		$(window).resize(function () {
			$('.js-fullheight').css('height', $(window).height());
		});

	};
	fullHeight();

	$('#sidebarCollapse').on('click', function () {
		$('#sidebar').toggleClass('active');
	});

})(jQuery);

$(document).ajaxSend(function () {
	$("#overlay").fadeIn(300);
});

$(document).ready(function () {
	$('#btnSearch').on('click', (e) => {
		var s = $('#loc').val();
		toggle();
		$('#loc').val('');
		$.ajax({
			url: "http://api.openweathermap.org/data/2.5/weather?q=" + s + "&APPID=f8e7426ee7910c7a363cd38cbd9b58f7&units=imperial",
			type: "GET",
			dataType: "json"
		}).done(function (json) {
			$.ajax({
				url: "http://api.openweathermap.org/data/2.5/uvi/forecast?APPID=f8e7426ee7910c7a363cd38cbd9b58f7&lat=" + json.coord.lat + "&lon=" + json.coord.lon + "&cnt=1",
				type: "GET",
				dataType: "json"
			}).done(function (data) {
				saveLoc(s);
				$.ajax({
					url: "http://api.openweathermap.org/data/2.5/forecast?q=" + json.name + "," + json.sys.country + "&cnt=5&APPID=f8e7426ee7910c7a363cd38cbd9b58f7&units=imperial",
					type: "GET",
					dataType: "json"
				}).done(function (day) {
					var iconcode = json.weather[0].icon;
					var iconurl = "http://openweathermap.org/img/w/" + iconcode + ".png";
					$('#image').attr('src', iconurl);
					$('#name').text(json.name + ", " + json.sys.country);
					$('#temp').html(json.main.temp + " <sup>o</sup>F");
					$('#hum').text(json.main.humidity);
					$('#speed').text(json.wind.speed);
					$('#uv').html('<p><span class="badge badge-danger">' + data[0].value + '</p></span>');
					console.log(day);
					popDays(day.list);
				}).fail(function (xhr, status, errorThrown) {
					$("#overlay").fadeOut(300);
					alert("5 days, there was a problem!");
				});;
			}).fail(function (xhr, status, errorThrown) {
				$("#overlay").fadeOut(300);
				alert("UV, there was a problem!");
			});;
		}).fail(function (xhr, status, errorThrown) {
			$("#overlay").fadeOut(300);
			alert("Sorry, there was a problem!");
		});
	});
	$("#loc").on('keyup', function (e) {
		if (e.keyCode === 13) {
			$('#btnSearch').click();
		}
	});
	myCurrentLo();
	getLoc();
});

function popDays(arr) {
	console.log(arr);
	$('#days').empty();
	$('#days').append('<div class="col-sm-1"></div>');
	for (const iterator of arr) {
		var iconcode = iterator.weather[0].icon;
		var iconurl = "http://openweathermap.org/img/w/" + iconcode + ".png";
		var html = '<div class="col-sm-2 col-xs-3 mb-2">';
		html += '<div class="card">';
		html += '<div class="card-body">';
		html += '<h5 class="card-title">' + new Date(iterator.dt_txt).toDateString() + '</h5>';
		html += '<img src="' + iconurl + '"/>';
		html += '<p class="card-text"> Temp: ' + iterator.main.temp + ' <sup>o</sup>F</p>';
		html += '<p class="card-text"> Humidity: ' + iterator.main.humidity + '%</p>';
		html += '</div>';
		html += '</div></div>';
		$('#days').append(html);
		$("#overlay").fadeOut(300);
	}
}

function myCurrentLo() {
	if (navigator) {
		navigator.geolocation.getCurrentPosition(function (position) {
			var lat = position.coords.latitude;
			var lon = position.coords.longitude;
			$.ajax({
				url: "http://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + lon + "&APPID=f8e7426ee7910c7a363cd38cbd9b58f7&units=imperial",
				type: "GET",
				dataType: "json"
			}).done(function (json) {
				$.ajax({
					url: "http://api.openweathermap.org/data/2.5/uvi/forecast?APPID=f8e7426ee7910c7a363cd38cbd9b58f7&lat=" + json.coord.lat + "&lon=" + json.coord.lon + "&cnt=1",
					type: "GET",
					dataType: "json"
				}).done(function (data) {
					$.ajax({
						url: "http://api.openweathermap.org/data/2.5/forecast?q=" + json.name + "," + json.sys.country + "&cnt=5&APPID=f8e7426ee7910c7a363cd38cbd9b58f7&units=imperial",
						type: "GET",
						dataType: "json"
					}).done(function (day) {
						var iconcode = json.weather[0].icon;
						var iconurl = "http://openweathermap.org/img/w/" + iconcode + ".png";
						$('#image').attr('src', iconurl);
						$('#name').text(json.name + ", " + json.sys.country);
						$('#temp').html(json.main.temp + " <sup>o</sup>F");
						$('#hum').text(json.main.humidity);
						$('#speed').text(json.wind.speed);
						$('#uv').text(data[0].value);
						popDays(day.list);
					}).fail(function (xhr, status, errorThrown) {
						$("#overlay").fadeOut(300);
						alert("5 days, there was a problem!");
					});;
				});
			}).fail(function (xhr, status, errorThrown) {
				$("#overlay").fadeOut(300);
				alert("Sorry, there was a problem!");
			});
		});
	} else {
		$("#overlay").fadeOut(300);
		alert("couldn't get your location");
	}
}

function saveLoc(loc) {
	var p = localStorage.getItem('p');
	if (p) {
		var myJson = [];
		myJson = JSON.parse(p);
		var res = isExist(loc, myJson);
		if (!res) {
			if (myJson.length < 5) {
				myJson.push(loc);
				localStorage.setItem('p', JSON.stringify(myJson));
			} else {
				myJson.shift();
				myJson.push(loc);
				localStorage.setItem('p', JSON.stringify(myJson));
			}
		}
	} else {
		var myJson = [loc];
		localStorage.setItem('p', JSON.stringify(myJson));
	}
	getLoc();
}

function getLoc() {
	var p = localStorage.getItem('p');
	if (p != null) {
		var myJson = JSON.parse(p);
		$('#history').empty();
		for (const iterator of myJson) {
			var html = "<li class='list' data-id='" + iterator + "'>" + iterator + "</li>"
			$('#history').append(html);
		}
	}
}

function isExist(val, arr) {
	var status = false;

	for (var i = 0; i < arr.length; i++) {
		var name = arr[i];
		if (name.toLowerCase() == val.toLowerCase()) {
			status = true;
			break;
		}
	}

	return status;
}

function toggle() {
	if ($(window).width() < 960) {
		$('#sidebar').toggleClass('active');
	}
}