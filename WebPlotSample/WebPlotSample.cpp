#include "WebPlot.h"
#include <iostream>

using namespace std;
using namespace WebPlotter;


int main(int argc, char* argv[])
{
	WebPlot webPlot(8080);

	Figure f;
	Plot p;
	Axes a;
	Series s;
	Series s2;

	a.addSeries(s);
	a.addSeries(s2);

	p.addAxes(a);

	f.addPlot(p);

	cout << f.getJSON() << endl;

	cout << f.getId() << endl;
	//f.removePlot(p);

	webPlot.addFigure(f);

	while(getchar())
	{
		webPlot.sendUpdate();
		webPlot.sendData(s);
	}

	system("pause");
	return 0;
}

