#ifndef SERIES_H
#define SERIES_H

#include "AutoId.h"

namespace WebPlotter {

	class Series : public AutoId {

	public:
		Series() : AutoId("Series") { }
	};

}
#endif