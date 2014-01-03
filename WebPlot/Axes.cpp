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

vector<Series> Axes::getSeriesList() {
	return seriesList;
}

string Axes::getJSON() {
	ostringstream s;
	s << "{";
	    s << "\"rangeX\": " << "\"auto\"" << ",";
		s << "\"rangeY\": " << "\"auto\""<< ",";
		s << "\"seriesList\": ";
		s << "{";
			for(auto i = seriesList.begin(); i != seriesList.end(); i++)
			{
				if (i != seriesList.begin()) 
					s << ", ";
				s << "\"" << i->getId() << "\": " << i->getJSON();
			}
		s << "}";
	s << "}";
	return s.str();
}