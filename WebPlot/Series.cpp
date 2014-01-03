#include "Series.h"

#include <string>
#include <sstream>
#include <cmath>

using namespace WebPlotter;
using namespace std;

string join(vector<float> v, string sep = ",") {
	ostringstream s;
	for(int i = 0; i < v.size(); i++) {
		if (i > 0)
			s << sep;
		s << v[i];
	}
	return s.str();
}

Series::Series() : AutoId("Series") {
	for(float x = 0; x < 2*3.1415926; x+= 0.01) {
		xs.push_back(x);
		ys.push_back(sin(x));
	}
}

string Series::getJSON() {
	ostringstream s;
	s << "{";
		s << "\"type\": " << "\"line\"" << ",";
		s << "\"color\": " << "\"#880000\"";
	s << "}";
	return s.str();
}

string Series::getDataJSON() {
	ostringstream s;
		s << "{";
			s << "\"xs\": [" << join(xs) << "],";
			s << "\"ys\": [" << join(ys) << "]";
		s << "}";
	return s.str();
}