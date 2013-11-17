#ifndef AUTOID_H
#define AUTOID_H

#include <sstream>

namespace WebPlotter {

	class AutoId {

	private:
		static int nextId;
		int id;
		std::string idPrefix;

	public:
		AutoId(std::string idPrefix) : id(nextId++), idPrefix(idPrefix) { }

		const std::string const getId() { 
			std::ostringstream os;
			os << idPrefix << "_" << id;
			return os.str();
		}

	};

}


#endif