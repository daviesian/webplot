#ifndef ARRAYSERIES_H
#define ARRAYSERIES_H

#include "Series.h"

#include <array>

namespace WebPlotter {

	class ArraySeries : public Series {

	private:

		float *xs, *ys;
		int size;

	protected:

		virtual std::pair<std::string, std::string> getPointStrings();
	
	public:
		ArraySeries(float* xs, float* ys, int size, SeriesType type = SCATTER) : Series(type), xs(xs), ys(ys), size(size) { };
	};

}
#endif