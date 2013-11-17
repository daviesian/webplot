#include "Figure.h"

using namespace std;
using namespace WebPlotter;

void Figure::addPlot(Plot& plot) {
	plots.push_back(plot);
}

bool Figure::removePlot(Plot& plot) {
	for (auto i = plots.begin(); i != plots.end(); i++) {
		if (i->getId() == plot.getId()) {
			plots.erase(i);
			return true;
		}
	}
	return false;
}