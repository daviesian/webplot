#include "Series.h"

#include <string>
#include <sstream>

using namespace WebPlotter;
using namespace std;

string Series::getJSON() {
	ostringstream s;
	s << "{\"" << getId() << "\": ";
		s << "{";
			s << "\"type\": " << "\"line\"" << ",";
			s << "\"color\": " << "\"#880000\"";
		s << "}";
	s << "}";
	return s.str();
}

string Series::getDataJSON() {
	ostringstream s;
	s << "{\"" << getId() << "\": ";
		s << "{";
			s << "\"xs\": [" << "0,1,2,3,4,5,6,7,8,9" << "],";
			s << "\"ys\": [" << "0,1,4,9,16,25,36,49,64,81" << "]";
		s << "}";
	s << "}";
	return s.str();
}