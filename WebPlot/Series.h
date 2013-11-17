#ifndef SERIES_H
#define SERIES_H

#include "AutoId.h"
#include "JSON.h"

namespace WebPlotter {

	class Series : public AutoId, public JSON {

	public:
		Series() : AutoId("Series") { }

		std::string getJSON();
	};

}
#endif