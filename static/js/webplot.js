var socket = null;
var seriesData = {};

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

    var canvas = $("<canvas/>").attr("id", id)
                               .addClass("axes")
                               .width(width)
                               .height(height);

    canvas.attr("width", canvas.width());
    canvas.attr("height", canvas.height());

    // Store a graphics context for later use.
    var ctx = canvas[0].getContext("2d");
    canvas.data("context", ctx);
    canvas.data("spec", a);
    canvas.data("margins", { left: 35, bottom: 30, top: 10, right: 10 });

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

    var innerHeight = height - margins.top - margins.bottom;
    var innerWidth = width - margins.left - margins.right;

    // Resize series canvases.
    var seriesCanvasList = axes.data("seriesCanvasList");
    for (var c in seriesCanvasList)
    {
        c = seriesCanvasList[c];
        c.width(innerWidth)
         .height(innerHeight)
         .css({ left: margins.left, top: margins.top });
        c.attr("width", c.width());
        c.attr("height", c.height());
        c.data("context", c[0].getContext("2d"));
    }
    
    // Draw axes.
    var tickLength = 5;


    // Work out axis ranges.

    if (spec.rangeX == "auto")
    {
        // If x-range is auto, cache range on all series and then calculate combined min and max for use in drawing ticks.
        var minX = null;//Number.MAX_VALUE;
        var maxX = null;//-Number.MAX_VALUE;
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
    }
    else
    {
        var minX = spec.rangeX[0];
        var maxX = spec.rangeX[1];
    }

    if (spec.rangeY == "auto")
    {
        // If y-range is auto, cache range on all series and then calculate combined min and max for use in drawing ticks.
        var minY = null;//Number.MAX_VALUE;
        var maxY = null;//-Number.MAX_VALUE;
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
        //console.log("Auto Y min", minY, ", max", maxY);
    }
    else
    {
        var minY = spec.rangeY[0];
        var maxY = spec.rangeY[1];
    }

    // Expand range slightly

    var rangeX = maxX - minX;
    var rangeY = maxY - minY;

    var expansion = 0.1;

    maxX += expansion * rangeX / 2;
    minX -= expansion * rangeX / 2;

    maxY += expansion * rangeY / 2;
    minY -= expansion * rangeY / 2;

    // Calculate and draw ticks.

    var xAxisY = 0;
    var yAxisX = 0;
    var xAxisTop = Math.floor(lerp(minY, maxY, Math.max(minY,Math.min(maxY,xAxisY)), margins.top + innerHeight, margins.top)) + 0.5;
    var yAxisLeft = Math.floor(lerp(minX, maxX, Math.max(minX,Math.min(maxX,yAxisX)), margins.left, margins.left + innerWidth)) + 0.5;

    ctx.beginPath();
    ctx.moveTo(margins.left + 0, xAxisTop);
    ctx.lineTo(margins.left + innerWidth, xAxisTop);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(yAxisLeft, height - (margins.bottom + 0));
    ctx.lineTo(yAxisLeft, height - (margins.bottom + innerHeight));
    ctx.stroke();

    ctx.textAlign = "center";
    ctx.textBaseline = "top";

    var ticksX = getTicks(minX, maxX, innerWidth, ctx);

    for (var t in ticksX.positions)
    {
        t = ticksX.positions[t];

        var x = Math.floor(lerp(minX, maxX, t, margins.left, margins.left + innerWidth)) + 0.5;
        if (Math.abs(x - yAxisLeft) > ticksX.space/2 || Math.abs(xAxisTop - (margins.top + innerHeight)) < 2)
            ctx.fillText(t.toFixed(Math.max(0,-ticksX.order+1)), x, xAxisTop + tickLength + 1);

        ctx.beginPath();
        ctx.moveTo(x, xAxisTop);
        ctx.lineTo(x, xAxisTop + tickLength);
        ctx.stroke();
    }

    ctx.textAlign = "right";
    ctx.textBaseline = "middle";


    var ticksY = getTicks(minY, maxY, innerHeight, ctx);

    for (var t in ticksY.positions)
    {
        t = ticksY.positions[t];

        var y = height - lerp(minY, maxY, t, margins.bottom, margins.bottom + innerHeight);
        if (Math.abs(y - xAxisTop) > ticksY.space/2 || Math.abs(yAxisLeft - margins.left) < 2)
            ctx.fillText(t.toFixed(Math.max(0, -ticksY.order + 1)), yAxisLeft - tickLength - 1, y);

        ctx.beginPath();
        ctx.moveTo(yAxisLeft - tickLength, Math.floor(y) + 0.5);
        ctx.lineTo(yAxisLeft, Math.floor(y) + 0.5);
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

    if (axesSpec.rangeX == "auto")
    {
        // If x-range is auto, look at cached range.
        if (seriesData[id].cachedMinX == undefined)
            cacheDataRange(id);
        var minX = seriesData[id].cachedMinX;
        var maxX = seriesData[id].cachedMaxX;
    }
    else
    {
        // rangeX is of the form [ min, max ]
        var minX = axesSpec.rangeX[0];
        var maxX = axesSpec.rangeX[1];
    }

    if (axesSpec.rangeY == "auto")
    {
        // If y-range is auto, look at cached range.
        if (seriesData[id].cachedMinY == undefined)
            cacheDataRange(id);
        var minY = seriesData[id].cachedMinY;
        var maxY = seriesData[id].cachedMaxY;
    }
    else
    {
        // rangeY is of the form [ min, max]
        var minY = axesSpec.rangeY[0];
        var maxY = axesSpec.rangeY[1];
    }

    if (axesSpec.rangeX == "auto" || axesSpec.rangeY == "auto")
    {
        redrawAxes(axes);
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

    /*if (isNaN(minTickDiff) || ! isFinite(minTickDiff))
    {
        console.warn("NaN in calculating ticks. Return none.");
        return [];
    }*/

    //console.log("minTickDiff", minTickDiff);

    var order = Math.ceil(Math.log(minTickDiff) / Math.log(10));

    var prevTwo = 2 * Math.pow(10, order - 1);   // e.g. 20
    var prevFive = 5 * Math.pow(10, order - 1);  // e.g. 50
    var one = Math.pow(10, order);               // e.g. 100
    var two = 2 * one;                           // e.g. 200
    var five = 5 * one;                          // e.g. 500

    var tickDiff = minTickDiff; // This should immediately get overwritten with something more sensible.

    if (prevTwo > minTickDiff)
        tickDiff = prevTwo;
    else if (prevFive > minTickDiff)
        tickDiff = prevFive;
    else if (one > minTickDiff)
        tickDiff = one;
    else if (two > minTickDiff)
        tickDiff = two;
    else if (five > minTickDiff)
        tickDiff = five;

    // tickDiff should now be correct.
    //console.log("tickDiff", tickDiff);

    var minTick = Math.ceil(min / tickDiff) * tickDiff;

    var ticks = [minTick];

    
    while (true)
    {
        var nextTick = ticks[ticks.length - 1] + tickDiff;
        if (nextTick > max)
            break;
        ticks.push(nextTick)
    }

    //console.log("ticks", ticks);
    return {
        positions: ticks,
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