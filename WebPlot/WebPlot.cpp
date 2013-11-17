#include "WebPlot.h"
#include <iostream>

using namespace std;
using namespace WebPlotter;



WebPlot::WebPlot(int port) {

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
