#ifndef AXES_H
#define AXES_H

#include "AutoId.h"
#include "Series.h"

#include <vector>

namespace WebPlotter {

	class Axes : public AutoId {
	private:

		std::vector<Series> seriesList;

	public:
		Axes() : AutoId("Axes") { }

		void addSeries(Series& series);
		bool removeSeries(Series& series);

	};
}

#endif