// constants -----------------------------------------------

var CONST = {
    MAP: {
        VIEWPORT_WIDTH_VARIANCE: 20,
        VIEWPORT_HEIGHT_VARIANCE: 30,
        CENTER_SIZE: 5,
        UNIT_SIZE: 5,
        UNIT_TO_CENTER: 10,
        OWNER_COLOR: ['#f00', '#0f0', '#00f', '#ff0', '#0ff', '#f0f'],
    },
};

// Raphael -----------------------------------------------

Raphael.fn.region = function(ID, pathString, center) {
    
    var shape = this.path(pathString);
    var center = this.circle(center.x, center.y, CONST.MAP.CENTER_SIZE);
    var overlay = this.path(pathString).attr({opacity: 0});
    overlay.regionID = ID;
    
    var region = this.set(shape, center, overlay).attr({fill: Raphael.getColor(), stroke: '#777', 'stroke-width': 2});
    
    region.regionID = ID;
    region.units = 0;
    region.owner = -1;
    
    return region;
};

// UnitacsClient ----------------------------------------------

function UnitacsClient() {
    
};

UnitacsClient.prototype.onMessage = function(messageObject) {
    if (messageObject.mapData) {
        this.map = new Map(messageObject.mapData);
    }
};

function Map(mapData) {
    this.height = mapData.height;
    this.width = mapData.width;
    
    this.build(mapData.regions);
    
    var that = this;
    window.onresize = function() {
        that.resize();
    };
};

Map.prototype.resize = function() {
    var viewport = getViewport();
    viewport[0] -= CONST.MAP.VIEWPORT_WIDTH_VARIANCE;
    viewport[1] -= CONST.MAP.VIEWPORT_HEIGHT_VARIANCE;
    
    var scaleX = viewport[0] / this.width;
    var scaleY = viewport[1] / this.height;
    var scale = (scaleX > scaleY) ? scaleY : scaleX;
    
    if (scale != 1) {
        this.mapSet.scale(scale, scale, 0, 0);
        this.paper.setSize(this.width * scale, this.height * scale);
    }
};

Map.prototype.build = function(regions) {
    this.paper = Raphael('map', this.width, this.height);
    this.regions = this.paper.set();
    
    for (var i = 0, ii = regions.length; i < ii; i++) {
        this.regions.push(this.paper.region(regions[i].ID, regions[i].pathString, regions[i].center));
    }
    
    var that = this;
    this.regions.click(function(event) {
        var region = that.regions[this.regionID];
        region.animate({fill: '#000'}, 500, '<');
        region.units++;
        console.log(that);
        console.log(this.regionID);
        console.log(that.regions[this.regionID].units);
    });
    
    this.regions.hover(function(event) {
        that.regions[this.regionID].toFront().attr({stroke: "#fff"});
    }, function(event) {
        that.regions[this.regionID].attr({stroke: "#777"});
    });
    
    this.mapSet = this.paper.set(
        this.regions
    );
    
    this.resize();
};

var client = new UnitacsClient();
client.onMessage({mapData: mapData});

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
};

var that = this;
region.update = function(arrivingUnits, owner) {
    if (owner == this.owner)
        this.units += arrivingUnits;
    else {
        this.units -= arrivingUnits;
        
        if (this.units == 0)
            this.owner = -1;
        else if (this.units < 0) {
            this.owner = owner
            this.units *= -1;
        }
    }
    
    if (this.units > 6)
        this.units = 6;
    
    var unitRotation = 0;
    var center = this[1];
    for (var i = 0; i < this.units; i++) {
        this.push(
            that.circle(
                center.attr("cx"),
                center.attr("cy") - CONST.MAP.UNIT_TO_CENTER,
                CONST.MAP.UNIT_SIZE
            ).attr({
                fill: CONST.MAP.OWNER_COLOR[this.owner],
                'stroke-width': 0,
                rotation: unitRotation + " " + center.attr("cx") + " " + center.attr("cy"),
            })
        );
        unitRotation += 60;
    }
};*/