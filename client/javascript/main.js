// constants -----------------------------------------------

var CONST = {
    MAP: {
        SCALE: 1,
        VIEWPORT_WIDTH_VARIANCE: 20,
        VIEWPORT_HEIGHT_VARIANCE: 30,
        CENTER_SIZE: 5,
        UNIT_SIZE: 5,
        UNIT_TO_CENTER: 20,
        UNITS_PER_REGION: 10,
        OWNER_COLOR: ['#f00', '#0f0', '#00f', '#ff0', '#0ff', '#f0f'],
    },
};
CONST.MAP.UNITCIRCLE_VECTOR = (
    function(number, distance){
        var vector = {x: 0, y: -distance};
        var angle = 2 * Math.PI / number;
        
        vector.rotate = function(angle) {
            return {
                x: this.x * Math.cos(angle) - this.y * Math.sin(angle),
                y: (this.x * Math.sin(angle) + this.y * Math.cos(angle))
            }
        };
        
        var vectors = [];
        for (var i = 0; i < number; i++) {
            vectors.push(vector.rotate(i * angle));
        }
        return vectors
    }
)(CONST.MAP.UNITS_PER_REGION, CONST.MAP.UNIT_TO_CENTER);

// testData -----------------------------------------------
var mapUpdate = function() {
    var update = [];
    for (var i = 0; i < 10; i++) {
        update.push({ID: rand(0,49), units: rand(0,CONST.MAP.UNITS_PER_REGION), ownerID: rand(0,2)});
    }
    return update;
};

// Raphael -----------------------------------------------

// FIXME: implement setOwner and setUnits
Raphael.fn.region = function(ID, pathString, center) {
    var overlay = this.path(pathString).attr({opacity: 0});
    overlay.regionID = ID;
    
    var region = this.set(
        this.path(pathString),
        this.circle(center.x, center.y, CONST.MAP.CENTER_SIZE),
        overlay
    ).attr({
        fill: Raphael.getColor(), 
        stroke: '#777', 
        'stroke-width': 2
    });
    
    region.center = center;
    region.regionID = ID;
    
    var that = this;
    region.update = function(units, ownerID) {
        this.units = units;
        this.ownerID = ownerID;
        
        if (this.units > CONST.MAP.UNITS_PER_REGION)
            this.units = CONST.MAP.UNITS_PER_REGION;
        
        if (this.items.length > 3)
            this.pop().remove();
            
        this.push(that.unitCircle(units, ownerID, center));
        this.items[2].toFront();
    };
    region.update(0, -1);
    
    return region;
};

Raphael.fn.unitCircle = function(units, ownerID, center) {
    if (ownerID < 0 || units <= 0)
        return 0;
    
    var unitCircle = this.set();
    for (var i = 0; i < units; i++) {
        unitCircle.push(
            this.circle(
                center.x + CONST.MAP.UNITCIRCLE_VECTOR[i].x,
                center.y + CONST.MAP.UNITCIRCLE_VECTOR[i].y,
                CONST.MAP.UNIT_SIZE
            ).attr({
                fill: CONST.MAP.OWNER_COLOR[ownerID],
            })
        );
    }
    
    return unitCircle.scale(CONST.MAP.SCALE, CONST.MAP.SCALE, 0, 0);
};

// UnitacsClient ----------------------------------------------

function UnitacsClient() {
    
};

UnitacsClient.prototype.onMessage = function(messageObject) {
    if (messageObject.mapData)
        this.map = new Map(messageObject.mapData);
        
    if (messageObject.mapUpdate) {
        for (var i = 0, ii = messageObject.mapUpdate.length; i < ii; i++) {
            var updateObject = messageObject.mapUpdate[i];
            this.map.regions[updateObject.ID].update(updateObject.units, updateObject.ownerID);
        }
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
    CONST.MAP.SCALE = (scaleX > scaleY) ? scaleY : scaleX;
    
    if (CONST.MAP.SCALE != 1) {
        this.mapSet.scale(CONST.MAP.SCALE, CONST.MAP.SCALE, 0, 0);
        this.paper.setSize(this.width * CONST.MAP.SCALE, this.height * CONST.MAP.SCALE);
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
        that.regions[this.regionID].items[0].animate({fill: '#000'}, 500, '<');
    });
    
    this.regions.hover(function(event) {
        that.regions[this.regionID].items[0].attr({'fill-opacity': 0.5});
    }, function(event) {
        that.regions[this.regionID].items[0].attr({'fill-opacity': 1});
    });
    
    this.mapSet = this.paper.set(
        this.regions
    );
    
    this.resize();
};

var client = new UnitacsClient();

client.onMessage({'mapData': mapData, 'mapUpdate': mapUpdate()});
setInterval("client.onMessage({'mapUpdate': mapUpdate()})", 3000);

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

function rand(minimum, maximum) {
    return Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
}