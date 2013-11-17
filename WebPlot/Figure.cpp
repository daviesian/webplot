#include "Figure.h"

using namespace std;
using namespace WebPlotter;

void Figure::addPlot(Plot& plot) {
	plotList.push_back(plot);
}

bool Figure::removePlot(Plot& plot) {
	for (auto i = plotList.begin(); i != plotList.end(); i++) {
		if (i->getId() == plot.getId()) {
			plotList.erase(i);
			return true;
		}
	}
	return false;
}

string Figure::getJSON() {
	ostringstream s;
	s << "{\"" << getId() << "\": ";
		s << "{";
			s << "\"plotList\": ";
			s << "[";
				for(auto i = plotList.begin(); i != plotList.end(); i++)
				{
					if (i != plotList.begin()) 
						s << ", ";
					s << i->getJSON();
				}
			s << "]";
		s << "}";
	s << "}";
	return s.str();
}