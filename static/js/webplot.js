var socket = null;

$(function() {

	socket = new WebSocket("ws://" + document.location.host + "/ws");
	socket.onmessage = socket_receive;
});

function socket_receive(e) {
	console.log(e.data);
	var j = JSON.parse(e.data);
	console.log(j);
}