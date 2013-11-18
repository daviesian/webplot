#include "WebPlot.h"
#include "mongoose.h"

#include <string>
#include <iostream>
#include <functional>

using namespace std;
using namespace WebPlotter;

// Called on every web request (including WebSocket connections)
int WebPlotter::Callbacks::mg_begin_request(mg_connection* conn) {
	auto t = static_cast<WebPlot*>(mg_get_request_info(conn)->user_data);

	string uri = string(mg_get_request_info(conn)->uri);

	if (uri.substr(0,5) == "/api/")
	{
		string fn = uri.substr(5);
		cout << "API Call: " << fn << endl;
		return 1;
	}

	// Log the request to the console.
	cout << "REQ: " << uri << endl;

	return 0; // We haven't handled this request
}

// Called whenever a new websocket connects.
void WebPlotter::Callbacks::mg_websocket_ready(mg_connection* conn) {
	auto wp = static_cast<WebPlot*>(mg_get_request_info(conn)->user_data);
	wp->webSockets.push_back(conn);
}

// Called when we receive data from a connected websocket.
int WebPlotter::Callbacks::mg_websocket_data(mg_connection* conn, int bits, char* data, size_t data_len) {
	auto t = static_cast<WebPlot*>(mg_get_request_info(conn)->user_data);
	
	// Echo data back for now.
	mg_websocket_write(conn, WEBSOCKET_OPCODE_TEXT, data, data_len);

	return 1; // Keep websocket alive
}

WebPlot::WebPlot(int port) {
	mg_callbacks callbacks = {};
	
	callbacks.begin_request = Callbacks::mg_begin_request;
	callbacks.websocket_ready = Callbacks::mg_websocket_ready;
	callbacks.websocket_data = Callbacks::mg_websocket_data;

	const char * options[] = {
		"document_root", "../static",
		"listening_ports", "9090",
		NULL
	};
	mg_start(&callbacks, this, options);
}

void WebPlot::addFigure(Figure& f) {
	figures.push_back(f);
}

bool WebPlot::removeFigure(Figure& f) {
	for(auto i = figures.begin(); i != figures.end(); i++) {
		if (i->getId() == f.getId()) {
			figures.erase(i);
			return true;
		}
	}
	return false;
}
