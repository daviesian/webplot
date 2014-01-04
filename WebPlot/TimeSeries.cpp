#include "TimeSeries.h"

#include <sstream>


using namespace WebPlotter;
using namespace std;

pair<string,string> TimeSeries::getPointStrings() {
	lock_guard<mutex> lock(pointMutex);

	ostringstream x,y;
	for(int i = 0; i < xs.size(); i++) {
		if (i > 0) {
			x << ",";
			y << ",";
		}

		x << xs[i];
		y << ys[i];
	}

	return pair<string,string>(x.str(),y.str());
}

void TimeSeries::addPoint(float time, float value) {
	
	{
		lock_guard<mutex> lock(pointMutex);
		xs.push_back(time);
		ys.push_back(value);
	}

	if (keepDuration > 0) {
		discardUpTo(time - keepDuration);
	}
}

void TimeSeries::discardUpTo(float time) {
	lock_guard<mutex> lock(pointMutex);

	while(xs.front() < time) {
		xs.pop_front();
		ys.pop_front();
	}
}