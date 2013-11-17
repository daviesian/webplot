#include "Axes.h"

#include <sstream>

using namespace WebPlotter;
using namespace std;

void Axes::addSeries(Series& series) {
	seriesList.push_back(series);
}

bool Axes::removeSeries(Series& series) {
	for (auto i = seriesList.begin(); i != seriesList.end(); i++) {
		if (i->getId() == series.getId()) {
			seriesList.erase(i);
			return true;
		}
	}
	return false;
}

string Axes::getJSON() {
	ostringstream s;
	s << "{\"" << getId() << "\": ";
		s << "{";
			s << "\"seriesList\": ";
			s << "[";
				for(auto i = seriesList.begin(); i != seriesList.end(); i++)
				{
					if (i != seriesList.begin()) 
						s << ", ";
					s << i->getJSON();
				}
			s << "]";
		s << "}";
	s << "}";
	return s.str();
}