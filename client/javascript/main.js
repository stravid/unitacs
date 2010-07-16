// constants

// map
MAP_WIDTH = 600;
MAP_HEIGHT = 500;
VIEWPORT_WIDTH_VARIANCE = 20;
VIEWPORT_HEIGHT_VARIANCE = 30;

planetsData = [
    {name: 'Albion', ID: 1, neighborIDs: [7, 10, 13, 19, 41], x: 135, y: 239},
    {name: 'Arcadia', ID: 2, neighborIDs: [4, 8, 9, 11, 31], x: 134, y: 449},
    {name: 'Atreus', ID: 3, neighborIDs: [12, 20, 21, 38], x: 395, y: 353},
    {name: 'Babylon', ID: 4, neighborIDs: [2, 8, 9, 11], x: 76, y: 482},
    {name: 'Barcella', ID: 5, neighborIDs: [23, 34, 40], x: 190, y: 48},
    {name: 'Bearclaw', ID: 6, neighborIDs: [27, 38], x: 558, y: 390},
    {name: 'Brim', ID: 7, neighborIDs: [1, 10, 13, 24, 31], x: 200, y: 296},
    {name: 'Circe', ID: 8, neighborIDs: [2, 4, 9, 11, 31], x: 75, y: 375},
    {name: 'Dagda', ID: 9, neighborIDs: [2, 4, 8, 11], x: 39, y: 479},
    {name: 'Delios', ID: 10, neighborIDs: [1, 7, 13, 22, 29], x: 203, y: 230},
    {name: 'Eden', ID: 11, neighborIDs: [2, 4, 8, 9], x: 21, y: 435},
    {name: 'Foster', ID: 12, neighborIDs: [3, 20, 21], x: 336, y: 366},
    {name: 'Gatekeeper', ID: 13, neighborIDs: [1, 7, 10, 24, 29, 31], x: 191, y: 278},
    {name: 'Glory', ID: 14, neighborIDs: [30, 32, 36], x: 440, y: 150},
    {name: 'Grants Station', ID: 15, neighborIDs: [19, 28, 41], x: 89, y: 157},
    {name: 'Hector', ID: 16, neighborIDs: [26, 32, 39], x: 564, y: 285},
    {name: 'Hellgate', ID: 17, neighborIDs: [18, 30], x: 331, y: 150},
    {name: 'Hoard', ID: 18, neighborIDs: [17, 30, 34], x: 324, y: 58},
    {name: 'Homer', ID: 19, neighborIDs: [1, 15, 41], x: 73, y: 229},
    {name: 'Huntress', ID: 20, neighborIDs: [3, 12, 21, 33], x: 342, y: 313},
    {name: 'Ironhold', ID: 21, neighborIDs: [3, 12, 20, 33], x: 341, y: 347},
    {name: 'Kirin', ID: 22, neighborIDs: [10, 29, 35], x: 194, y: 156},
    {name: 'Londerholm', ID: 23, neighborIDs: [5, 28], x: 132, y: 59},
    {name: 'Lum', ID: 24, neighborIDs: [7, 13, 31, 33], x: 252, y: 323},
    {name: 'Marshall', ID: 25, neighborIDs: [33, 36], x: 371, y: 234},
    {name: 'New Kent', ID: 26, neighborIDs: [16, 32, 39], x: 494, y: 261},
    {name: 'Niles', ID: 27, neighborIDs: [6, 38], x: 497, y: 418},
    {name: 'Paxon', ID: 28, neighborIDs: [15, 23], x: 78, y: 66},
    {name: 'Priori', ID: 29, neighborIDs: [10, 13, 22, 33], x: 250, y: 225},
    {name: 'Roche', ID: 30, neighborIDs: [14, 17, 18, 37], x: 381, y: 74},
    {name: 'Shadow', ID: 31, neighborIDs: [2, 7, 8, 13, 24], x: 236, y: 344},
    {name: 'Sheridan', ID: 32, neighborIDs: [14, 16, 26, 39], x: 502, y: 229},
    {name: 'Strana Mechty', ID: 33, neighborIDs: [20, 21, 24, 25, 29, 31], x: 317, y: 292},
    {name: 'Strato Domingo', ID: 34, neighborIDs: [5, 18, 35, 40], x: 264, y: 62},
    {name: 'Tamaron', ID: 35, neighborIDs: [22, 34], x: 232, y: 109},
    {name: 'Tathis', ID: 36, neighborIDs: [14, 25], x: 420, y: 193},
    {name: 'Tiber', ID: 37, neighborIDs: [30], x: 422, y: 54},
    {name: 'Tokasha', ID: 38, neighborIDs: [3, 6, 27, 39], x: 467, y: 373},
    {name: 'Tranquil', ID: 39, neighborIDs: [16, 26, 32, 38], x: 512, y: 320},
    {name: 'Vinton', ID: 40, neighborIDs: [5, 34], x: 250, y: 24},
    {name: 'York', ID: 41, neighborIDs: [1, 15, 19], x: 97, y: 213} 
];

// -----------------------------------------------

function UnitacsClient() {
    console.log('client started');
    
    this.initMap();
    
    var that = this;
    window.onresize = function() {
        that.resizeMap();
    };
};

UnitacsClient.prototype.initMap = function() {
    console.log('map initialized');
    
    this.map = Raphael('map', MAP_WIDTH, MAP_HEIGHT);
    
    this.mapSet = this.map.set();
    var rect = this.map.rect(0, 0, MAP_WIDTH, MAP_HEIGHT).attr({stroke: "#fff"});
    this.mapSet.push(rect);
    
    for (var i = 0; i < planetsData.length; i++) {
        var planet = this.map.circle(planetsData[i].x, planetsData[i].y, 5).attr({fill: '#ffffff',stroke: '#fffff'});
        this.mapSet.push(planet);
        var name = this.map.text(planetsData[i].x, planetsData[i].y - 15, planetsData[i].name).attr({fill: '#ffffff','font-size': 15});
        this.mapSet.push(name);
        for (var j = 0; j < planetsData[i].neighborIDs.length; j++) {
            var edge = this.map.path('M ' + planetsData[i].x + ', ' + planetsData[i].y + ' L ' + planetsData[planetsData[i].neighborIDs[j] - 1].x + ', ' + planetsData[planetsData[i].neighborIDs[j] - 1].y + 'Z').attr({stroke: '#ffffff',opacity: 0.1});
            this.mapSet.push(edge);
        }
    }
    
    this.resizeMap();
};

UnitacsClient.prototype.resizeMap = function() {
    console.log('map resized');
    
    var viewport = getViewport();
    viewport[0] -= VIEWPORT_WIDTH_VARIANCE;
    viewport[1] -= VIEWPORT_HEIGHT_VARIANCE;
    
    this.map.setSize(viewport[0], viewport[1]);
    
    var scaleX = viewport[0] / MAP_WIDTH;
    var scaleY = viewport[1] / MAP_HEIGHT;
    var scale = (scaleX > scaleY) ? scaleY : scaleX;
    
    if (scale != 1)
        this.mapSet.scale(scale, scale, 0, 0);
};

var client = new UnitacsClient();

/*function load() {
    var planetsData = [
        {name: 'Albion', ID: 1, neighborIDs: [7, 10, 13, 19, 41], x: 135, y: 239},
        {name: 'Arcadia', ID: 2, neighborIDs: [4, 8, 9, 11, 31], x: 134, y: 449},
        {name: 'Atreus', ID: 3, neighborIDs: [12, 20, 21, 38], x: 395, y: 353},
        {name: 'Babylon', ID: 4, neighborIDs: [2, 8, 9, 11], x: 76, y: 482},
        {name: 'Barcella', ID: 5, neighborIDs: [23, 34, 40], x: 190, y: 48},
        {name: 'Bearclaw', ID: 6, neighborIDs: [27, 38], x: 558, y: 390},
        {name: 'Brim', ID: 7, neighborIDs: [1, 10, 13, 24, 31], x: 200, y: 296},
        {name: 'Circe', ID: 8, neighborIDs: [2, 4, 9, 11, 31], x: 75, y: 375},
        {name: 'Dagda', ID: 9, neighborIDs: [2, 4, 8, 11], x: 39, y: 479},
        {name: 'Delios', ID: 10, neighborIDs: [1, 7, 13, 22, 29], x: 203, y: 230},
        {name: 'Eden', ID: 11, neighborIDs: [2, 4, 8, 9], x: 21, y: 435},
        {name: 'Foster', ID: 12, neighborIDs: [3, 20, 21], x: 336, y: 366},
        {name: 'Gatekeeper', ID: 13, neighborIDs: [1, 7, 10, 24, 29, 31], x: 191, y: 278},
        {name: 'Glory', ID: 14, neighborIDs: [30, 32, 36], x: 440, y: 150},
        {name: 'Grants Station', ID: 15, neighborIDs: [19, 28, 41], x: 89, y: 157},
        {name: 'Hector', ID: 16, neighborIDs: [26, 32, 39], x: 564, y: 285},
        {name: 'Hellgate', ID: 17, neighborIDs: [18, 30], x: 331, y: 150},
        {name: 'Hoard', ID: 18, neighborIDs: [17, 30, 34], x: 324, y: 58},
        {name: 'Homer', ID: 19, neighborIDs: [1, 15, 41], x: 73, y: 229},
        {name: 'Huntress', ID: 20, neighborIDs: [3, 12, 21, 33], x: 342, y: 313},
        {name: 'Ironhold', ID: 21, neighborIDs: [3, 12, 20, 33], x: 341, y: 347},
        {name: 'Kirin', ID: 22, neighborIDs: [10, 29, 35], x: 194, y: 156},
        {name: 'Londerholm', ID: 23, neighborIDs: [5, 28], x: 132, y: 59},
        {name: 'Lum', ID: 24, neighborIDs: [7, 13, 31, 33], x: 252, y: 323},
        {name: 'Marshall', ID: 25, neighborIDs: [33, 36], x: 371, y: 234},
        {name: 'New Kent', ID: 26, neighborIDs: [16, 32, 39], x: 494, y: 261},
        {name: 'Niles', ID: 27, neighborIDs: [6, 38], x: 497, y: 418},
        {name: 'Paxon', ID: 28, neighborIDs: [15, 23], x: 78, y: 66},
        {name: 'Priori', ID: 29, neighborIDs: [10, 13, 22, 33], x: 250, y: 225},
        {name: 'Roche', ID: 30, neighborIDs: [14, 17, 18, 37], x: 381, y: 74},
        {name: 'Shadow', ID: 31, neighborIDs: [2, 7, 8, 13, 24], x: 236, y: 344},
        {name: 'Sheridan', ID: 32, neighborIDs: [14, 16, 26, 39], x: 502, y: 229},
        {name: 'Strana Mechty', ID: 33, neighborIDs: [20, 21, 24, 25, 29, 31], x: 317, y: 292},
        {name: 'Strato Domingo', ID: 34, neighborIDs: [5, 18, 35, 40], x: 264, y: 62},
        {name: 'Tamaron', ID: 35, neighborIDs: [22, 34], x: 232, y: 109},
        {name: 'Tathis', ID: 36, neighborIDs: [14, 25], x: 420, y: 193},
        {name: 'Tiber', ID: 37, neighborIDs: [30], x: 422, y: 54},
        {name: 'Tokasha', ID: 38, neighborIDs: [3, 6, 27, 39], x: 467, y: 373},
        {name: 'Tranquil', ID: 39, neighborIDs: [16, 26, 32, 38], x: 512, y: 320},
        {name: 'Vinton', ID: 40, neighborIDs: [5, 34], x: 250, y: 24},
        {name: 'York', ID: 41, neighborIDs: [1, 15, 19], x: 97, y: 213} 
    ];
    
    var viewport = getViewport();
    var scaleX = viewport[0] / 600;
    var scaleY = viewport[1] / 500;
    var scale = (scaleX > scaleY) ? scaleY : scaleX;
    
    var map = Raphael(0, 0, viewport[0], viewport[1]);
    var planetSet = map.set();
    var edgeSet = map.set();
    var nameSet = map.set();
    var highlightEdgeSet = map.set();
    var graph = new Array(planetsData.length);
    
    for (var i = 0; i < planetsData.length; i++) {
        graph[i] = new Array(planetsData.length);
        
        for (var j = 0; j < planetsData.length; j++) {
            graph[i][j] = 0;
        }
    }
    
    for (var i = 0; i < planetsData.length; i++) {
        planetSet.push(map.circle(planetsData[i].x * scale, planetsData[i].y * scale, 5));
        planetSet[i].planetID = planetsData[i].ID;
        nameSet.push(map.text(planetsData[i].x * scale, planetsData[i].y * scale - 15, planetsData[i].name));
    }
    
    for (var i = 0; i < planetsData.length; i++) {
        for (var j = 0; j < planetsData[i].neighborIDs.length; j++) {
            edgeSet.push(map.path('M ' + planetsData[i].x * scale + ', ' + planetsData[i].y * scale + ' L ' + planetsData[planetsData[i].neighborIDs[j] - 1].x * scale + ', ' + planetsData[planetsData[i].neighborIDs[j] - 1].y * scale + 'Z'));
            graph[planetsData[i].ID - 1][planetsData[i].neighborIDs[j] - 1] = 1;
        }
    }
    
    planetSet.attr({
        fill: '#ffffff',
        stroke: '#fffff'
    });
    
    edgeSet.attr({
        stroke: '#ffffff',
        opacity: 0.1
    });
    
    nameSet.attr({
        fill: '#ffffff',
        'font-size': 15
    });
    
    planetSet.toFront();
    
    
    
    planetSet.click(function(event) {
        
        highlightEdgeSet.remove();
        
        for (var i = 0; i < planetsData[this.planetID - 1].neighborIDs.length; i++) {
            highlightEdgeSet.push(map.path('M ' + planetsData[this.planetID - 1].x * scale + ', ' + planetsData[this.planetID - 1].y * scale + ' L ' + planetsData[planetsData[this.planetID - 1].neighborIDs[i] - 1].x * scale + ', ' + planetsData[planetsData[this.planetID - 1].neighborIDs[i] - 1].y * scale + 'Z'));
        }
        
        highlightEdgeSet.attr({
            stroke: '#ffe500'
        });
        
        highlightEdgeSet.toBack();
        
        //console.log(this.planetID);
    });
    
    var departureID;
    
    
    planetSet.mousedown(function(event) {
        //console.log('departureID: ' + this.planetID);
        
        departureID = this.planetID;
    });
    
    planetSet.mouseup(function(event) {
        //console.log('destinationID: ' + this.planetID);
        
        if (departureID == this.planetID)
            return;
        
        var dijkstra = new Dijkstra(graph, departureID - 1);
        var predecessors = dijkstra.getPredecessors();
        
        var way = new Array();
        var tempNode = this.planetID - 1;
            
        way.push(tempNode);
    
        while (predecessors[tempNode] != undefined) {
            way.unshift(predecessors[tempNode]);
            tempNode = predecessors[tempNode];
        }
        
        //console.log('Shortest calculated path is ' + way.join());
        
        highlightEdgeSet.remove();
        
        var oldNode;
        var i = 0;
        
        while (way.length > ++i) {
            highlightEdgeSet.push(map.path('M ' + planetsData[way[i - 1]].x * scale + ', ' + planetsData[way[i - 1]].y * scale + ' L ' + planetsData[way[i]].x * scale + ', ' + planetsData[way[i]].y * scale + 'Z'));
        }
        
        /*for (var i = 0; i < planetsData[this.planetID - 1].neighborIDs.length; i++) {
            highlightEdgeSet.push(map.path('M ' + planetsData[this.planetID - 1].x * scale + ', ' + planetsData[this.planetID - 1].y * scale + ' L ' + planetsData[planetsData[this.planetID - 1].neighborIDs[i] - 1].x * scale + ', ' + planetsData[planetsData[this.planetID - 1].neighborIDs[i] - 1].y * scale + 'Z'));
        }*/
        
        /*highlightEdgeSet.attr({
            stroke: '#ffe500'
        });
        
        highlightEdgeSet.toBack();
    });
    
    
};
*/
// http://andylangton.co.uk/articles/javascript/get-viewport-size-javascript/
function getViewport() {
    var viewPortWidth;
    var viewPortHeight;

    // the more standards compliant browsers (mozilla/netscape/opera/IE7) use window.innerWidth and window.innerHeight
    if (typeof window.innerWidth != 'undefined') {
        viewPortWidth = window.innerWidth;
        viewPortHeight = window.innerHeight;
    }

    // IE6 in standards compliant mode (i.e. with a valid doctype as the first line in the document)
    else if (typeof document.documentElement != 'undefined'
    && typeof document.documentElement.clientWidth !=
    'undefined' && document.documentElement.clientWidth != 0) {
        viewPortWidth = document.documentElement.clientWidth;
        viewPortHeight = document.documentElement.clientHeight;
    }
    
    // older versions of IE
    else {
        viewPortWidth = document.getElementsByTagName('body')[0].clientWidth;
        viewPortHeight = document.getElementsByTagName('body')[0].clientHeight;
    }
    
    return [viewPortWidth, viewPortHeight];
};
/*
function Dijkstra(adjacencyMatrix, source) {
    this.matrix = adjacencyMatrix;
    this.nodes = new Array();
    this.Q = new Array();
    this.source = source;
    this.distance = new Array();
    this.predecessor = new Array();
    
    
    this.initialize = function() {
        for (var i = 0; i < this.matrix.length; i++) {
            this.distance[i] = Infinity;
            this.predecessor[i] = undefined;
            this.Q.push(i);
        }
        
        this.distance[source] = 0;
    }
    
    this.calculate = function() {
        while (this.Q.length > 0) {
            var u, that = this;
            
            this.Q.sort(function(a, b) {
                if (that.distance[a] < that.distance[b])
                    return -1;
                else
                    return 1;
            });
            
            u = this.Q.shift();
            
            if (this.distance[u] == Infinity)
                break;
            
            for (var i = 0; i < this.matrix[u].length; i++) {
                if (this.matrix[u][i] > 0) {
                    var alternativeDistance = this.distance[u] + this.matrix[u][i];
                    
                    if (alternativeDistance < this.distance[i]) {
                        this.distance[i] = alternativeDistance;
                        this.predecessor[i] = u;
                    }
                }
            }
        }
    }
    
    this.initialize();
    this.calculate();
    
    this.getDistances = function() {
        return this.distance;
    }
    
    this.getPredecessors = function() {
        return this.predecessor;
    }
};*/