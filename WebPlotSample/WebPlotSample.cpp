#include "WebPlot.h"
#include <iostream>

using namespace std;
using namespace WebPlotter;


int main(int argc, char* argv[])
{
	WebPlot webPlot(8080);


	Figure f;
	Plot p;
	f.addPlot(p);


	cout << f.getId() << endl;
	f.removePlot(p);

	system("pause");
	return 0;
}

