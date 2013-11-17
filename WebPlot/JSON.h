#ifndef TOJSON_H
#define TOJSON_H

#include <string>
#include <vector>

namespace WebPlotter {

	class JSON {
	public:
		virtual std::string getJSON() = 0;

	};

}

#endif