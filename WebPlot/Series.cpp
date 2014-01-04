#include "Series.h"

#include <string>
#include <sstream>
#include <cmath>

using namespace WebPlotter;
using namespace std;

string typeToString(SeriesType t) {
	switch (t)
	{
	case WebPlotter::LINE:
		return "line";
	case WebPlotter::SCATTER:
		return "scatter";
	default:
		return "scatter";
	}
}

string Series::getJSON() {
	ostringstream s;
	s << "{";
		s << "\"type\": " << "\"" << typeToString(type) << "\"" << ",";
		s << "\"color\": " << "\"" << color << "\"";
	s << "}";
	return s.str();
}

string Series::getDataJSON() {
	pair<string,string> pointStrings = getPointStrings();

	ostringstream s;
		s << "{";
			s << "\"xs\": [" << pointStrings.first << "],";
			s << "\"ys\": [" << pointStrings.second << "]";
		s << "}";
	return s.str();
}

SeriesType Series::getType() {
	return type;
}

void Series::setType(SeriesType t) {
	type = t;
}

string Series::getColor() {
	return color;
}

void Series::setColor(string c) {
	color = c;
}