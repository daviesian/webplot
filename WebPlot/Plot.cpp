#include "Plot.h"

using namespace std;
using namespace WebPlotter;

void Plot::addAxes(Axes& axes) {
	axesList.push_back(axes);
}

bool Plot::removeAxes(Axes& axes) {
	for (auto i = axesList.begin(); i != axesList.end(); i++) {
		if (i->getId() == axes.getId()) {
			axesList.erase(i);
			return true;
		}
	}
	return false;
}

vector<Axes> Plot::getAxesList() {
	return axesList;
}

string Plot::getJSON() {
	ostringstream s;
	s << "{";
		s << "\"axesList\": ";
		s << "{";
			for(auto i = axesList.begin(); i != axesList.end(); i++)
			{
				if (i != axesList.begin()) 
					s << ", ";
				s << "\"" << i->getId() << "\": " << i->getJSON();
			}
		s << "}";
	s << "}";
	return s.str();
}