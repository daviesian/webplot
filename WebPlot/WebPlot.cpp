#include "WebPlot.h"
#include "mongoose.h"

#include <string>
#include <iostream>

using namespace std;
using namespace WebPlotter;

int mg_begin_request(mg_connection* conn) {
	cout << "BEGIN REQUEST" << endl;

	string content = "Hello world";

	mg_printf(conn,
        "HTTP/1.1 200 OK\r\n"
        "Content-Type: text/plain\r\n"
        "Content-Length: %d\r\n"        // Always set Content-Length
        "\r\n"
        "%s",
		content.length(), content.c_str());

	return 1;
}

WebPlot::WebPlot(int port) {
	mg_callbacks callbacks = {};

	callbacks.begin_request = mg_begin_request;

	const char * options[] = {
		"listening_ports", "8080",
		NULL
	};
	mg_start(&callbacks, NULL, options);
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
