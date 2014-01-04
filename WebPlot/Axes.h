#ifndef AXES_H
#define AXES_H

#include "AutoId.h"
#include "Series.h"

#include <vector>

namespace WebPlotter {

	class Axes : public AutoId, public JSON {
	private:

		bool autoX, autoY;
		float minX, maxX, minY, maxY;
		std::vector<Series*> seriesList;

	public:
		Axes() : AutoId("Axes"), autoX(true), autoY(true) { }
		Axes(float minX, float maxX) : AutoId("Axes"), autoX(false), autoY(true), minX(minX), maxX(maxX) { }
		Axes(float minX, float maxX, float minY, float maxY) : AutoId("Axes"), autoX(false), autoY(false), minX(minX), maxX(maxX), minY(minY), maxY(maxY) { }

		void addSeries(Series& series);
		bool removeSeries(Series& series);
		std::vector<Series*> getSeriesList();

		std::string getJSON();

		void setRangeX(float min, float max) { autoX = false; minX = min; maxX = max; };
		void setRangeY(float min, float max) { autoY = false; minY = min; maxY = max; };
		void setAutoRangeX() { autoX = true; };
		void setAutoRangeY() { autoY = true; };
	};
}

#endif