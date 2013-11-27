#ifndef WEBPLOT_H
#define WEBPLOT_H

#include "Figure.h"
#include "JSON.h"
#include "mongoose.h"

#include <vector>

namespace WebPlotter {

	class WebPlot : public JSON {

	private:
		std::vector<Figure> figures;

		mg_connection* webSocket;

		void sendMessage(std::string msg);

		static int mg_begin_request(mg_connection* conn);
		static void mg_websocket_ready(mg_connection* conn);
		static int mg_websocket_data(mg_connection* conn, int bits, char* data, size_t data_len);


	public:

		WebPlot(int port);

		void addFigure(Figure& f);
		bool removeFigure(Figure& f);

		std::string getJSON();

		void sendUpdate();
		void sendData(Series& series);
	
	};

}

#endif