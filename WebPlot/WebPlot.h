#ifndef WEBPLOT_H
#define WEBPLOT_H

#include "Figure.h"
#include "mongoose.h"

#include <vector>

namespace WebPlotter {

	namespace Callbacks {
		int mg_begin_request(mg_connection* conn);
		void mg_websocket_ready(mg_connection* conn);
		int mg_websocket_data(mg_connection* conn, int bits, char* data, size_t data_len);
	}

	class WebPlot {

	private:
		std::vector<Figure> figures;

		std::vector<mg_connection*> webSockets;

		friend int WebPlotter::Callbacks::mg_begin_request(mg_connection* conn);
		friend void WebPlotter::Callbacks::mg_websocket_ready(mg_connection* conn);
		friend int WebPlotter::Callbacks::mg_websocket_data(mg_connection* conn, int bits, char* data, size_t data_len);

	public:

		WebPlot(int port);

		void addFigure(Figure& f);
		bool removeFigure(Figure& f);
	};

}

#endif