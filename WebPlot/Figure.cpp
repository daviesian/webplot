#include "WebPlot.h"
#include "Figure.h"

using namespace std;
using namespace WebPlotter;

void Figure::addPlot(Plot& plot) {
	plotList.push_back(plot);
	if (webPlot != NULL)
		webPlot->sendUpdate();
}

bool Figure::removePlot(Plot& plot) {
	for (auto i = plotList.begin(); i != plotList.end(); i++) {
		if (i->getId() == plot.getId()) {
			plotList.erase(i);
			sendUpdate();
			return true;
		}
	}
	sendUpdate();
	return false;
}

void Figure::sendUpdate() {
	if (webPlot != NULL)
		webPlot->sendUpdate();
}

string Figure::getJSON() {
	ostringstream s;
	s << "{";
		s << "\"plotList\": ";
		s << "{";
			for(auto i = plotList.begin(); i != plotList.end(); i++)
			{
				if (i != plotList.begin()) 
					s << ", ";
				s << "\"" << i->getId() << "\": " << i->getJSON();
			}
		s << "}";
	s << "}";
	return s.str();
}