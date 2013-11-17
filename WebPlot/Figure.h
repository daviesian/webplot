#ifndef FIGURE_H
#define FIGURE_H

#include "AutoId.h"
#include "Plot.h"

#include <vector>

namespace WebPlotter {

	class WebPlot;
	class Figure : public AutoId, public JSON {

	private:

		std::vector<Plot> plotList;

	public:
		Figure() : AutoId("Figure") { }

		void addPlot(Plot& plot);
		bool removePlot(Plot& plot);

		std::string getJSON();
	};
}


#endif