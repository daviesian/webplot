#ifndef TIMESERIES_H
#define TIMESERIES_H

#include "Series.h"

#include <deque>

namespace WebPlotter {

	class TimeSeries : public Series {

	private:

		std::deque<float> xs, ys;
		float keepDuration;

	protected:

		virtual std::pair<std::string, std::string> getPointStrings();
	
	public:
		TimeSeries(float keepDuration = 0, SeriesType type = LINE) : Series(type), keepDuration(keepDuration) { };

		void addPoint(float time, float value);

		void discardUpTo(float time);
	};

}
#endif