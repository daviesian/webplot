#include "ArraySeries.h"

#include <sstream>

using namespace std;
using namespace WebPlotter;

pair<string, string> ArraySeries::getPointStrings()
{
	ostringstream x,y;

	for(int i = 0; i < size; i++) {
		if (i > 0) {
			x << ","; 
			y << ",";
		}

		x << xs[i];
		y << ys[i];
	}
	return pair<string, string>(x.str(),y.str());
}