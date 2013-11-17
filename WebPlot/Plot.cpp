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

string Plot::getJSON() {
	ostringstream s;
	s << "{\"" << getId() << "\": ";
		s << "{";
			s << "\"axesList\": ";
			s << "[";
				for(auto i = axesList.begin(); i != axesList.end(); i++)
				{
					if (i != axesList.begin()) 
						s << ", ";
					s << i->getJSON();
				}
			s << "]";
		s << "}";
	s << "}";
	return s.str();
}