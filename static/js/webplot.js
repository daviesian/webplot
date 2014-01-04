var socket = null;
var seriesData = {};

var PIXEL_RATIO = (function ()
{
    var ctx = document.createElement("canvas").getContext("2d"),
        dpr = window.devicePixelRatio || 1,
        bsr = ctx.webkitBackingStorePixelRatio ||
              ctx.mozBackingStorePixelRatio ||
              ctx.msBackingStorePixelRatio ||
              ctx.oBackingStorePixelRatio ||
              ctx.backingStorePixelRatio || 1;

    return dpr / bsr;
})();

function createHiDPICanvas(w, h)
{
    var ratio = PIXEL_RATIO;
    var can = document.createElement("canvas");
    can.width = w * ratio;
    can.height = h * ratio;
    can.style.width = w + "px";
    can.style.height = h + "px";
    can.getContext("2d").setTransform(ratio, 0, 0, ratio, 0, 0);
    return $(can);
}

function resizeHiDPICanvas(can, w, h)
{
    var ratio = PIXEL_RATIO;
    can.width = w * ratio;
    can.height = h * ratio;
    can.style.width = w + "px";
    can.style.height = h + "px";
    can.getContext("2d").setTransform(ratio, 0, 0, ratio, 0, 0);
    return $(can);
}

function roundToPixel(x)
{
    return Math.round(x*PIXEL_RATIO)/PIXEL_RATIO + 0.5/PIXEL_RATIO;
}

$(function() {

	socket = new WebSocket("ws://" + document.location.host + "/ws");
	socket.onmessage = socket_receive;
	socket.onopen = function () { console.log("Socket connected") };
	socket.onclose = function () { console.error("Socket closed") };
	socket.onerror = function () { console.error("Socket error") };
});

function socket_receive(e) {
	//console.log(e.data);
	var j = JSON.parse(e.data);
	//console.log(j);

	var fullUpdate = j["webPlot"];
	var dataUpdate = j["dataUpdate"];

	if (fullUpdate != undefined)
	    doFullUpdate(j["webPlot"]);

	if (dataUpdate != undefined)
	    doDataUpdate(j["dataUpdate"]);
}

function doFullUpdate(u)
{
    console.log("Full Update:", u);

    clearFigures();
    var container = $("#figures");
    for (var f in u.figureList)
    {
        var figure = createFigure(f, u.figureList[f], container);


    }
}

function clearFigures()
{
    $(".figure").remove();
    //seriesList = {};
}

function createFigure(id, f, container)
{
    console.info("Create Figure:", f);

    // Create the div for the figure
    var div = $("<div/>").attr("id", id)
                         .addClass("figure");

    // Add this figure to the actual page.
    container.append(div);
    // Create the plots, add them to the div.

    for (var p in f.plotList)
    {
        var plot = createPlot(p, f.plotList[p], div.width(), 300);
        div.append(plot);
    }

    return div;
}

function createPlot(id, p, width, height)
{
    console.info("Create Plot:", p);

    // Create the div for the plot
    var div = $("<div/>").attr("id", id)
                         .addClass("plot")
                         .width(width)
                         .height(height);

    for (var a in p.axesList)
    {
        // Create the axes. If the plot has, say, a title, this is the place to make the axes smaller.
        var canvasList = createAxes(a, p.axesList[a], width, height);

        for (var c in canvasList)
            div.append(canvasList[c]);
    }

    return div;
}

function createAxes(id, a, width, height)
{
    console.info("Create Axes", a);

    // Create the canvas which will actually contain the graphics.

    var canvas = createHiDPICanvas(width, height).attr("id", id)
                               .addClass("axes");
                               //.width(width)
                               //.height(height);

    //canvas.attr("width", canvas.width()*2);
    //canvas.attr("height", canvas.height()*2);

    // Store a graphics context for later use.
    var ctx = canvas[0].getContext("2d");
    canvas.data("context", ctx);
    canvas.data("spec", a);
    canvas.data("margins", { left: 40, bottom: 30, top: 10, right: 20 });

    var seriesCanvasList = [];
    // Build a reverse-lookup hash of series.
    for (var s in a.seriesList)
    {
        //seriesList[s] = a.seriesList[s];
        //seriesList[s].axes = id;
        var seriesCanvas = $("<canvas/>").attr("id", s)
                                         .addClass("series");

        seriesCanvas.data("axes", canvas);
        seriesCanvas.data("spec", a.seriesList[s]);
        seriesCanvasList.push(seriesCanvas);

        seriesData[s] = {};
    }

    canvas.data("seriesCanvasList", seriesCanvasList);

    redrawAxes(canvas);

    return [canvas].concat(seriesCanvasList);
}

function redrawAxes(axes)
{
    var spec = axes.data("spec");
    var ctx = axes.data("context");
    var margins = axes.data("margins");

    //console.log("Redraw axes:", axes.attr("id"));

    ctx.font = "16px sans-serif";

    var height = axes.height();
    var width = axes.width();

    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = 'black';
    ctx.lineWidth = 1 / PIXEL_RATIO;

    var innerHeight = height - margins.top - margins.bottom;
    var innerWidth = width - margins.left - margins.right;

    // Resize series canvases.
    var seriesCanvasList = axes.data("seriesCanvasList");
    for (var c in seriesCanvasList)
    {
        c = seriesCanvasList[c];
        resizeHiDPICanvas(c[0], innerWidth, innerHeight)
            .css({ left: margins.left, top: margins.top });
        //c.attr("width", c.width());
        //c.attr("height", c.height());
        c.data("context", c[0].getContext("2d"));
    }
    
    // Draw axes.
    var tickLength = 5;


    // Work out axis ranges.
    var expansion = 0.1;

    if (spec.rangeX == "auto")
    {
        // If x-range is auto, cache range on all series and then calculate combined min and max for use in drawing ticks.
        var minX = null;
        var maxX = null;
        for (var sc in seriesCanvasList)
        {
            var seriesId = seriesCanvasList[sc].attr("id");
            if (seriesData[seriesId].cachedMinX == undefined)
                cacheDataRange(seriesId);

            minX = Math.min(minX || Number.MAX_VALUE, seriesData[seriesId].cachedMinX);
            maxX = Math.max(maxX || -Number.MAX_VALUE, seriesData[seriesId].cachedMaxX);
        }
        //console.log("Auto X min", minX, ", max", maxX);

        minX = minX == null ? NaN : minX;
        maxX = maxX == null ? NaN : maxX;

        // Expand range slightly

        var rangeX = maxX - minX;

        maxX += expansion * rangeX / 2;
        minX -= expansion * rangeX / 2;

        seriesData[seriesId].axesMinX = minX;
        seriesData[seriesId].axesMaxX = maxX;

    }
    else
    {
        var minX = spec.rangeX[0];
        var maxX = spec.rangeX[1];
    }

    if (spec.rangeY == "auto")
    {
        // If y-range is auto, cache range on all series and then calculate combined min and max for use in drawing ticks.
        var minY = null;
        var maxY = null;
        for (var sc in seriesCanvasList)
        {
            var seriesId = seriesCanvasList[sc].attr("id");
            if (seriesData[seriesId].cachedMinY == undefined)
                cacheDataRange(seriesId);

            minY = Math.min(minY || Number.MAX_VALUE, seriesData[seriesId].cachedMinY);
            maxY = Math.max(maxY || -Number.MAX_VALUE, seriesData[seriesId].cachedMaxY);
        }

        minY = minY == null ? NaN : minY;
        maxY = maxY == null ? NaN : maxY;

        // Expand range slightly

        var rangeY = maxY - minY;

        maxY += expansion * rangeY / 2;
        minY -= expansion * rangeY / 2;

        seriesData[seriesId].axesMinY = minY;
        seriesData[seriesId].axesMaxY = maxY;

    }
    else
    {
        var minY = spec.rangeY[0];
        var maxY = spec.rangeY[1];
    }

    // Draw axis lines

    var xAxisY = 0;
    var yAxisX = 0;
    var xAxisTop = roundToPixel(lerp(minY, maxY, Math.max(minY,Math.min(maxY,xAxisY)), margins.top + innerHeight, margins.top));
    var yAxisLeft = roundToPixel(lerp(minX, maxX, Math.max(minX,Math.min(maxX,yAxisX)), margins.left, margins.left + innerWidth));

    ctx.beginPath();
    ctx.moveTo(margins.left + 0, xAxisTop);
    ctx.lineTo(margins.left + innerWidth, xAxisTop);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(yAxisLeft, height - (margins.bottom + 0));
    ctx.lineTo(yAxisLeft, height - (margins.bottom + innerHeight));
    ctx.stroke();

    // Calculate and draw ticks.

    ctx.textAlign = "center";
    ctx.textBaseline = "top";


    var ticksX = getTicks(minX, maxX, innerWidth, ctx);

    for (var t in ticksX.minorPositions)
    {
        t = ticksX.minorPositions[t];

        var x = roundToPixel(lerp(minX, maxX, t, margins.left, margins.left + innerWidth));
        ctx.beginPath();
        ctx.moveTo(x, xAxisTop);
        ctx.lineTo(x, xAxisTop + tickLength / 2);
        ctx.stroke();
    }

    for (var t in ticksX.positions)
    {
        t = ticksX.positions[t];

        var x = roundToPixel(lerp(minX, maxX, t, margins.left, margins.left + innerWidth));
        if (Math.abs(x - yAxisLeft) > ticksX.space / 2 || Math.abs(xAxisTop - (margins.top + innerHeight)) < 2)
            ctx.fillText(t.toFixed(Math.max(0, -ticksX.order + 1)), x, xAxisTop + tickLength + 1);

        ctx.beginPath();
        ctx.moveTo(x, xAxisTop);
        ctx.lineTo(x, xAxisTop + tickLength);
        ctx.stroke();
    }

    ctx.textAlign = "right";
    ctx.textBaseline = "middle";


    var ticksY = getTicks(minY, maxY, innerHeight, ctx);

    for (var t in ticksY.minorPositions)
    {
        t = ticksY.minorPositions[t];

        var y = roundToPixel(height - lerp(minY, maxY, t, margins.bottom, margins.bottom + innerHeight));

        ctx.beginPath();
        ctx.moveTo(yAxisLeft - tickLength/2, y);
        ctx.lineTo(yAxisLeft, y);
        ctx.stroke();
    }

    for (var t in ticksY.positions)
    {
        t = ticksY.positions[t];

        var y = roundToPixel(height - lerp(minY, maxY, t, margins.bottom, margins.bottom + innerHeight));
        if (Math.abs(y - xAxisTop) > ticksY.space / 2 || Math.abs(yAxisLeft - margins.left) < 2)
            ctx.fillText(t.toFixed(Math.max(0, -ticksY.order + 1)), yAxisLeft - tickLength - 5, y);

        ctx.beginPath();
        ctx.moveTo(yAxisLeft - tickLength, y);
        ctx.lineTo(yAxisLeft, y);
        ctx.stroke();
    }
}

function redrawSeries(id)
{
    var series = $("#" + id);
    var axes = series.data("axes");

    //console.log("Redraw series", id, "on axes", axes[0]);

    var axesSpec = axes.data("spec");
    var seriesSpec = series.data("spec");

    //console.log("Series spec:", seriesSpec, "Axes spec:", axesSpec);

    if (axesSpec.rangeX == "auto" || axesSpec.rangeY == "auto")
    {
        redrawAxes(axes);
    }

    if (axesSpec.rangeX == "auto")
    {
        // Axes must have been redrawn by now.
        if (seriesData[id].axesMinX == undefined)
        {
            console.error("Axes not redrawn before series redraw");
            return;
        }

        var minX = seriesData[id].axesMinX;
        var maxX = seriesData[id].axesMaxX;
    }
    else
    {
        // rangeX is of the form [ min, max ]
        var minX = axesSpec.rangeX[0];
        var maxX = axesSpec.rangeX[1];
    }

    if (axesSpec.rangeY == "auto")
    {
        // Axes must have been redrawn by now.
        if (seriesData[id].axesMinX == undefined)
        {
            console.error("Axes not redrawn before series redraw");
            return;
        }

        var minY = seriesData[id].axesMinY;
        var maxY = seriesData[id].axesMaxY;
    }
    else
    {
        // rangeY is of the form [ min, max]
        var minY = axesSpec.rangeY[0];
        var maxY = axesSpec.rangeY[1];
    }


    var width = series.width();
    var height = series.height();

    var ctx = series.data("context");
    ctx.clearRect(0, 0, width, height);

    if (seriesSpec.type == "line")
    {
        ctx.strokeStyle = seriesSpec.color;
        ctx.beginPath();
        ctx.moveTo(lerp(minX, maxX, seriesData[id].xs[0], 0, width), lerp(minY, maxY, seriesData[id].ys[0], height, 0));

        for (var i = 1; i < seriesData[id].xs.length; i++)
        {
            ctx.lineTo(lerp(minX, maxX, seriesData[id].xs[i], 0, width), lerp(minY, maxY, seriesData[id].ys[i], height, 0));
        }
        ctx.stroke();
    }
    else if (seriesSpec.type == "scatter")
    {
        ctx.fillStyle = seriesSpec.color;

        for (var i = 0; i < seriesData[id].xs.length; i++)
        {
            ctx.fillRect(lerp(minX, maxX, seriesData[id].xs[i], 0, width) - 5, lerp(minY, maxY, seriesData[id].ys[i], height, 0) - 5, 10, 10);
        }
    }
}

function lerp(inMin, inMax, val, outMin, outMax)
{
    var frac = (val - inMin) / (inMax - inMin);
    return outMin + frac * (outMax - outMin);
}

function getTicks(min, max, length, ctx)
{
    //console.log("getTicks", min, max, length);
    if (isNaN(min) || isNaN(max) || isNaN(length) || !isFinite(min) || !isFinite(max) || !isFinite(length) || min == max)
    {
        console.warn("NaN or infinity in calculating ticks. Return none.", min, max, length);
        return [];
    }

    var orderMax = max == 0 ? 1 : Math.ceil(Math.log(Math.abs(max)) / Math.log(10));
    var sizeString = new Array(Math.abs(orderMax) + 4).join("0");
    //console.log(max, order, sizeString);
    var minTickSpace = ctx.measureText(sizeString).width;

    var maxTicks = length / minTickSpace;

    var range = max - min;

    var minTickDiff = range / maxTicks;

    var order = Math.ceil(Math.log(minTickDiff) / Math.log(10));

    var prevTwo = 2 * Math.pow(10, order - 1);   // e.g. 20
    var prevFive = 5 * Math.pow(10, order - 1);  // e.g. 50
    var one = Math.pow(10, order);               // e.g. 100
    var two = 2 * one;                           // e.g. 200
    var five = 5 * one;                          // e.g. 500

    var tickDiff = minTickDiff; // This should immediately get overwritten with something more sensible.

    if (prevTwo > minTickDiff)
    {
        tickDiff = prevTwo;
        minorTickDiff = prevTwo / 2;
    }
    else if (prevFive > minTickDiff)
    {
        tickDiff = prevFive;
        minorTickDiff = prevFive / 5;
    }
    else if (one > minTickDiff)
    {
        tickDiff = one;
        minorTickDiff = one / 2;
    }
    else if (two > minTickDiff)
    {
        tickDiff = two;
        minorTickDiff = two / 2;
    }
    else if (five > minTickDiff)
    {
        tickDiff = five;
        minorTickDiff = five / 5;
    }

    // tickDiff should now be correct.
    //console.log("tickDiff", tickDiff);

    var minTick = Math.ceil(min / tickDiff) * tickDiff;

    // Make sure we generate enough ticks.
    var tickCount = Math.ceil((max - min) / tickDiff) + 1;
    var minorTickCount = Math.ceil((max - min) / minorTickDiff) + 1;

    var ticks = [minTick];

    for (var i = 1; i < tickCount; i++)
    {
        var nextTick = minTick + i * tickDiff;
        if (nextTick > max)
            break;
        ticks.push(nextTick);
    }

    var minorTicks = [minTick];

    for (var i = 1; i < minorTickCount; i++)
    {
        var nextTick = minTick + i * minorTickDiff;
        if (nextTick > max)
            break;
        minorTicks.push(nextTick);
    }

    //console.log("ticks", ticks);
    return {
        positions: ticks,
        minorPositions: minorTicks,
        order: order,
        space: minTickSpace
    };
}

function doDataUpdate(u)
{
    for (var seriesId in u)
    {
        //console.log("Update series data for", seriesId, ":", u[seriesId]);
        seriesData[seriesId] = u[seriesId];
        redrawSeries(seriesId);
    }
}

function cacheDataRange(seriesId)
{
    var data = seriesData[seriesId];

    var minX = Number.MAX_VALUE;
    var maxX = -Number.MAX_VALUE;
    var minY = Number.MAX_VALUE;
    var maxY = -Number.MAX_VALUE;

    if (data.xs == undefined || data.ys == undefined || data.xs.length != data.ys.length || data.xs.length == 0)
    {
        console.warn("Cannot cache data range on", seriesId);
        return;
    }

    for (var i = 0; i < data.xs.length; i++)
    {
        minX = Math.min(minX, data.xs[i]);
        maxX = Math.max(maxX, data.xs[i]);
        minY = Math.min(minY, data.ys[i]);
        maxY = Math.max(maxY, data.ys[i]);
    }

    seriesData[seriesId].cachedMinX = minX;
    seriesData[seriesId].cachedMaxX = maxX;
    seriesData[seriesId].cachedMinY = minY;
    seriesData[seriesId].cachedMaxY = maxY;
}