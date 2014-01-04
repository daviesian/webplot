#ifndef SERIES_H
#define SERIES_H

#include "AutoId.h"
#include "JSON.h"

namespace WebPlotter {

	enum SeriesType {
		LINE,
		SCATTER
	};

	class Series : public AutoId, public JSON {

	private:
		SeriesType type;
		std::string color;

	protected:

		virtual std::pair<std::string, std::string> getPointStrings() = 0;

	public:
		Series() : AutoId("Series"), type(SCATTER), color("#880000") { };
		Series(SeriesType type) : AutoId("Series"), type(type), color("#880000") { };

		std::string getJSON();
		std::string getDataJSON();

		SeriesType getType();
		void setType(SeriesType type);

		std::string getColor();
		void setColor(std::string color);
		
	};

}
#endif