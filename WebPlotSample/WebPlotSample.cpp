#include "WebPlot.h"
#include <iostream>
#include <deque>
#include <cmath>

using namespace std;
using namespace WebPlotter;


int main(int argc, char* argv[])
{
	WebPlot webPlot(8080);

	Figure f;
	Plot p;
	Plot p2;
	Axes a;
	Axes a2;
	Series s;
	Series s2;

	a.addSeries(s);
	a2.addSeries(s2);

	p.addAxes(a);
	p2.addAxes(a2);

	f.addPlot(p);
	f.addPlot(p2);

	webPlot.addFigure(f);

	while(true || getchar())
	{
		for(int i = 0; i < s2.ys.size() - 1; i++)
		{
			s2.ys[i] = s2.ys[i+1];
			s2.xs[i] = s2.xs[i+1];
		}
		s2.xs[s2.xs.size()-1]+= 0.01;
		s2.ys[s2.ys.size()-1] = sin(s2.xs[s2.xs.size()-1]);
		//cout << "Update sent." << endl;
		//webPlot.sendUpdate();
		webPlot.sendData(s2);
	}

	return 0;
}

