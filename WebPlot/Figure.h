#ifndef FIGURE_H
#define FIGURE_H

#include "AutoId.h"
#include "Plot.h"

#include <vector>

namespace WebPlotter {

	class WebPlot;
	class Figure : public AutoId, public JSON {

	private:

		WebPlot* webPlot;
		std::vector<Plot> plotList;

		void sendUpdate();

	public:
		Figure() : AutoId("Figure"), webPlot(NULL) { }

		void addPlot(Plot& plot);
		bool removePlot(Plot& plot);

		std::string getJSON();

		const std::vector<Plot> getPlots() { return plotList; }

		friend class WebPlotter::WebPlot;
		friend class WebPlotter::Plot;
	};
}


#endif