#ifndef WEBPLOT_H
#define WEBPLOT_H

#include "Figure.h"

#include <vector>

namespace WebPlotter {

	class WebPlot {

	private:
		std::vector<Figure> figures;

	public:

		WebPlot(int port);

		void addFigure(Figure& f);
		bool removeFigure(Figure& f);
	};

}

#endif