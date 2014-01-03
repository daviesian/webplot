#ifndef SERIES_H
#define SERIES_H

#include "AutoId.h"
#include "JSON.h"

namespace WebPlotter {

	class Series : public AutoId, public JSON {

	private:


	public:
		Series();

		std::string getJSON();
		std::string getDataJSON();
		std::vector<float> xs;
		std::vector<float> ys;
	};

}
#endif