#ifndef PLOT_H
#define PLOT_H

#include "AutoId.h"
#include "Axes.h"

#include <vector>

namespace WebPlotter {

	class Plot : public AutoId, public JSON {

	private:
		std::vector<Axes> axesList;

	public:
		Plot() : AutoId("Plot") { }

		void addAxes(Axes& axes);
		bool removeAxes(Axes& axes);

		std::string getJSON();
	};

}

#endif