#include "WebPlot.h"
#include "ArraySeries.h"
#include "TimeSeries.h"

#include <iostream>
#include <deque>
#include <cmath>

using namespace std;
using namespace WebPlotter;


int main(int argc, char* argv[])
{
	WebPlot webPlot(8080);

	const int size = 100;
	float xs[size];
	float ys[size];

	for (int i = 0; i < size; i++) {
		xs[i] = i*2*3.1415926 / size;
		ys[i] = sin(xs[i]);
	}

	Figure f;
	Plot p;
	Plot p2;
	Axes a(0,10);
	Axes a2;
	ArraySeries s(xs,ys,size, LINE);
	TimeSeries s2(300);

	a.addSeries(s);
	a2.addSeries(s2);

	p.addAxes(a);
	p2.addAxes(a2);

	f.addPlot(p);
	f.addPlot(p2);

	webPlot.addFigure(f);

	int count = 0;
	while(true||getchar())
	{
		
		for(int i = 0; i < size - 1; i++)
		{
			ys[i] = ys[i+1];
			xs[i] = xs[i+1];
		}
		xs[size-1] += 2*3.1415926 / size;
		ys[size-1] = sin(xs[size-1]);

		s2.addPoint(count, sin(count/100.0));
		count++;
		//cout << "Update sent." << endl;
		//webPlot.sendUpdate();
		webPlot.sendData(s2);
	}

	return 0;
}

