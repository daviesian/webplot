#include "Series.h"

#include <string>
#include <sstream>

using namespace WebPlotter;
using namespace std;

string Series::getJSON() {
	ostringstream s;
	s << "{\"" << getId() << "\": ";
		s << "{";
			s << "\"type\": " << "line" << ",";
			s << "\"color\": " << "\"#880000\"";
		s << "}";
	s << "}";
	return s.str();
}