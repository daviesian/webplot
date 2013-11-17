#ifndef PLOT_H
#define PLOT_H

#include "AutoId.h"
#include "Axes.h"

#include <vector>

namespace WebPlotter {

	class Plot : public AutoId {

	private:
		std::vector<Axes> axesList;

	public:
		Plot() : AutoId("Plot") { }

		void addAxes(Axes& axes);
		bool removeAxes(Axes& axes);
	};

}

#endif