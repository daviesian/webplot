#include "WebPlot.h"
#include "mongoose.h"

#include <string>
#include <iostream>
#include <functional>

using namespace std;
using namespace WebPlotter;

// Called on every web request (including WebSocket connections)
int WebPlot::mg_begin_request(mg_connection* conn) {
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
void WebPlot::mg_websocket_ready(mg_connection* conn) {
	auto wp = static_cast<WebPlot*>(mg_get_request_info(conn)->user_data);
	wp->webSocket = conn;

	wp->sendUpdate();
	wp->sendData();
}

// Called when we receive data from a connected websocket.
int WebPlot::mg_websocket_data(mg_connection* conn, int bits, char* data, size_t data_len) {
	auto t = static_cast<WebPlot*>(mg_get_request_info(conn)->user_data);
	
	// Echo data back for now.
	mg_websocket_write(conn, WEBSOCKET_OPCODE_TEXT, data, data_len);

	return 1; // Keep websocket alive
}

WebPlot::WebPlot(int port) : webSocket(NULL) {
	mg_callbacks callbacks = {};
	
	callbacks.begin_request = WebPlot::mg_begin_request;
	callbacks.websocket_ready = WebPlot::mg_websocket_ready;
	callbacks.websocket_data = WebPlot::mg_websocket_data;

	stringstream ss;
	ss << port;
	string s = ss.str();
	const char * cstr = s.c_str();

	const char * options[] = {
		"document_root", "../static",
		"listening_ports", cstr,
		"request_timeout_ms", "0",
		NULL
	};
	mg_start(&callbacks, this, options);
	cout << "WebPlot server started on port " << port << endl;
}

void WebPlot::addFigure(Figure& f) {
	f.webPlot = this;
	figures.push_back(f);
	sendUpdate();
}

bool WebPlot::removeFigure(Figure& f) {
	for(auto i = figures.begin(); i != figures.end(); i++) {
		if (i->getId() == f.getId()) {
			figures.erase(i);
			sendUpdate();
			return true;
		}
	}
	sendUpdate();
	return false;
}

void WebPlot::sendMessage(string msg) {
	if (webSocket != NULL) {
		mg_websocket_write(webSocket, WEBSOCKET_OPCODE_TEXT, msg.c_str(), msg.length());
	}
}

string WebPlot::getJSON() {
	ostringstream s;
	s << "{\"webPlot\": ";
		s << "{";
			s << "\"figureList\": ";
			s << "{";
				for(auto i = figures.begin(); i != figures.end(); i++)
				{
					if (i != figures.begin()) 
						s << ", ";
					s << "\"" << i->getId() << "\": " << i->getJSON();
				}
			s << "}";
		s << "}";
	s << "}";
	return s.str();
}

void WebPlot::sendUpdate() {
	sendMessage(getJSON());
}

void WebPlot::sendData(Series& series) {
	ostringstream s;
	s << "{\"dataUpdate\": ";
		s << "{";
			s << "\"" << series.getId() << "\": " << series.getDataJSON();
		s << "}";
	s << "}";

	string msg = s.str();

	sendMessage(msg);
}

void WebPlot::sendData() {
	bool firstSeries = true;
	ostringstream s;
	s << "{\"dataUpdate\": ";
		s << "{";
		for(Figure f : this->figures)
			for(Plot p : f.getPlots()) 
				for(Axes a : p.getAxesList())
					for(Series sr : a.getSeriesList())
					{
						if (!firstSeries)
							s << ",";
						s << "\"" << sr.getId() << "\": " << sr.getDataJSON();
						firstSeries = false;
					}
		s << "}";
	s << "}";

	string msg = s.str();

	sendMessage(msg);
}