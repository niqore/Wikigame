var socket;

$(document).ready(function () {
	socket = io();
	socket.on('objectives', function(objectives) {
		load_page(objectives['begin']);
		load_objective(objectives['end']);
	});
	socket.on('update player', function(playerInfo) {
		players[playerInfo.pseudo] = playerInfo;
		refreshPlayers();
	});
});

function quitGame() {
	socket.emit('quitGame');
	document.location.reload(true);
}

var objective = '#';
var lastHref = "";
var lastPage = "";
var players = {};

function addPlayer(player) {
	$('#players').append('<li id=\'li-' + player['pseudo'] + '\'>' + player['pseudo'] + '<br>Page: ' + player['page'] + '<br>Nombre de pages parcourues: ' + player['pageCount'] + '</li><br>');
}

function refreshPlayers() {
	$('#players').html('');
	Object.entries(players).forEach(entry => {
		addPlayer(entry[1]);
	});
}

function load_page(page) {
	$.ajax({
		type : "GET",
		url: "https://fr.wikipedia.org/w/api.php?action=parse&page=" + page + "&format=json&origin=*",
		dataType: "json",
		beforeSend: function() {
			$("#loader").show();
			$("#webpage").html("");
		},
		success : function(data){
			$("#loader").hide();
			lastPage = page;
			$("#firstHeading").text(data.parse.title);
			socket.emit('update page', data.parse.title);
			$("#webpage").html(data.parse.text["*"]);
			$('#webpage a').click(function(e) {
				var href = $(this).attr('href');
				var local = href.startsWith(lastHref + "#") || href.startsWith("#");
				if (!local) {
					e.preventDefault();
				}
				if (href.startsWith("/wiki/") && !href.includes(":")) {
					$('html,body').scrollTop(0);
					lastHref = href.split('#')[0].substr(6);//Put # back in header after load
					load_page(lastHref);
				}
			});
			if (objective == data.parse.title) {
				socket.emit('game end');
			}
		},
		error : function(request,error){
			$("#loader").hide();
			$("#webpage").html('<p>Une erreur est survenue lors du chargement de la page</p><br><a class="link" onclick="load_page(' + lastPage + ')">Retourner à la page précédente</a><a class="link" onclick="load_page(' + page + ')">Recharger la page</a>');
		}
	});
}

function load_objective(page) {
	objective = page;
	$.ajax({
		type : "GET",
		url: "https://fr.wikipedia.org/w/api.php?action=parse&page=" + page + "&format=json&origin=*",
		dataType: "json",
		success : function(data){
			$("#objectiveHeading").text(data.parse.title);
			$("#objectivepage").html(data.parse.text["*"]);
			$('#objectivepage a').click(function(e) {
				var local = $(this).attr('href').includes("#");
				if (!local) {
					e.preventDefault();
				}
			});
		},
		error : function(request,error){
			alert('Une erreur est survenue lors du chargement de la page');
		}
	});
}

function showPageActuelle() {
	$("#pageactuelle").addClass("selected");
	$("#objectivepage").hide();
	$("#objectiveHeading").hide();
	$("#pagearrivee").removeClass("selected");
	$("#resultats").removeClass("selected");
	$("#resultspage").hide();
	$("#resultsPageHeading").hide();
	$("#webpage").show();
	$("#firstHeading").show();
}

function showPageFin() {
	$("#pageactuelle").removeClass("selected");
	$("#webpage").hide();
	$("#firstHeading").hide();
	$("#resultats").removeClass("selected");
	$("#resultspage").hide();
	$("#resultsPageHeading").hide();
	$("#pagearrivee").addClass("selected");
	$("#objectivepage").show();
	$("#objectiveHeading").show();
}

function showResults() {
	$("#pageactuelle").removeClass("selected");
	$("#webpage").hide();
	$("#firstHeading").hide();
	$("#objectivepage").hide();
	$("#objectiveHeading").hide();
	$("#pagearrivee").removeClass("selected");
	$("#resultats").addClass("selected");
	$("#resultspage").show();
	$("#resultsPageHeading").show();
}

/*function getCookie(name) {
  var value = "; " + document.cookie;
  var parts = value.split("; " + name + "=");
  if (parts.length == 2) return parts.pop().split(";").shift();
}

var socket;
var objective = '#';

function changePseudo() {
	var pseudo = $('#pseudoinput').val();
	if (pseudo != '') {
		document.cookie = "pseudo=" + pseudo + "; expires= 01 Jan 2030 00:00:00 UTC";
		socket.emit('update pseudo', pseudo);
	}
}

function addPlayer(player) {
	$('#players').append('<li id=\'li-' + player['socket'] + '\'>' + player['pseudo'] + '<br>Page: ' + player['page'] + '<br>Nombre de pages parcourues: ' + player['pageCount'] + '</li><br>');
}

$(document).ready(function () {
	var pseudo = getCookie('pseudo');
	if (pseudo == null) {
		document.cookie = "pseudo=Guest" + Math.floor(Math.random() * 100001) + "; expires= 01 Jan 2030 00:00:00 UTC";
	}
	socket = io();
	socket.on('players list', function(players) {
		$('#players').html('');
		Object.entries(players).forEach(entry => {
			addPlayer(entry[1]);
		});
	});
	socket.on('player disconnect', function(ioID) {
		$('#li-' + ioID).remove();
	});
	socket.on('objectives', function(objectives) {
		load_page(objectives['begin']);
		load_objective(objectives['end']);
	});
	socket.on('results', function(results) {
		setResultsPage(results);
	});
	socket.on('game end', function(player) {
		alert(player + ' a gagné!');
	});
	$('#pseudoform').submit(function() {
		changePseudo();
		return false;
	});
	$('#pseudoinput').val(pseudo);
});

var lastHref = "";
var lastPage = "";

function load_page(page) {
	$.ajax({
		type : "GET",
		url: "https://fr.wikipedia.org/w/api.php?action=parse&page=" + page + "&format=json&origin=*",
		dataType: "json",
		beforeSend: function() {
			$("#loader").show();
			$("#webpage").html("");
		},
		success : function(data){
			$("#loader").hide();
			lastPage = page;
			$("#firstHeading").text(data.parse.title);
			socket.emit('update page', data.parse.title);
			$("#webpage").html(data.parse.text["*"]);
			$('#webpage a').click(function(e) {
				var href = $(this).attr('href');
				var local = href.startsWith(lastHref + "#") || href.startsWith("#");
				if (!local) {
					e.preventDefault();
				}
				if (href.startsWith("/wiki/") && !href.includes(":")) {
					$('html,body').scrollTop(0);
					lastHref = href.split('#')[0].substr(6);//Put # back in header after load
					load_page(lastHref);
				}
			});
			if (objective == data.parse.title) {
				socket.emit('game end');
			}
		},
		error : function(request,error){
			$("#loader").hide();
			$("#webpage").html('<p>Une erreur est survenue lors du chargement de la page</p><br><a class="link" onclick="load_page(' + lastPage + ')">Retourner à la page précédente</a><a class="link" onclick="load_page(' + page + ')">Recharger la page</a>');
		}
	});
}

function load_objective(page) {
	objective = page;
	$.ajax({
		type : "GET",
		url: "https://fr.wikipedia.org/w/api.php?action=parse&page=" + page + "&format=json&origin=*",
		dataType: "json",
		success : function(data){
			$("#objectiveHeading").text(data.parse.title);
			$("#objectivepage").html(data.parse.text["*"]);
			$('#objectivepage a').click(function(e) {
				var local = $(this).attr('href').includes("#");
				if (!local) {
					e.preventDefault();
				}
			});
		},
		error : function(request,error){
			alert('Une erreur est survenue lors du chargement de la page');
		}
	});
}

function setResultsPage(results) {
	html = '';
	for (var i in results) {
		p = results[i];
		html += '<h3>' + p['pseudo'];
		if (p['winner']) {
			html += ' - GAGNANT';
		}
		html += '</h3><p><strong>Nombre de victoires: </strong>' + p['winCount'] + '</p><p><strong>Nombre de pages parcourues: </strong>' + p['pagesPath'].length + '</p><p><strong>Pages parcourues: </strong></p><p>';
		for (var i = 0; i < p['pagesPath'].length - 1; ++i) {
			html += p['pagesPath'][i] + ' <strong>-></strong> ';
		}
		html += p['pagesPath'][p['pagesPath'].length - 1];
		html += '</p><br><br>';
	}
	$("#resultspage").html(html);
}

function page_loaded(url) {
	load_page(url);
}

function showPageActuelle() {
	$("#pageactuelle").addClass("selected");
	$("#objectivepage").hide();
	$("#objectiveHeading").hide();
	$("#pagearrivee").removeClass("selected");
	$("#resultats").removeClass("selected");
	$("#resultspage").hide();
	$("#resultsPageHeading").hide();
	$("#webpage").show();
	$("#firstHeading").show();
}

function showPageFin() {
	$("#pageactuelle").removeClass("selected");
	$("#webpage").hide();
	$("#firstHeading").hide();
	$("#resultats").removeClass("selected");
	$("#resultspage").hide();
	$("#resultsPageHeading").hide();
	$("#pagearrivee").addClass("selected");
	$("#objectivepage").show();
	$("#objectiveHeading").show();
}

function showResults() {
	$("#pageactuelle").removeClass("selected");
	$("#webpage").hide();
	$("#firstHeading").hide();
	$("#objectivepage").hide();
	$("#objectiveHeading").hide();
	$("#pagearrivee").removeClass("selected");
	$("#resultats").addClass("selected");
	$("#resultspage").show();
	$("#resultsPageHeading").show();
}

function restartObjectives() {
	socket.emit('restart');	
}*/