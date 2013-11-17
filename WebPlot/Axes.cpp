#include "Axes.h"

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