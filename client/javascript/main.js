// constants -----------------------------------------------

// FIXME: better solution
var CONST = {
    MAP: {
        SCALE: 1,
        VIEWPORT_WIDTH_VARIANCE: 20,
        VIEWPORT_HEIGHT_VARIANCE: 30,
        CENTER_SIZE: 5, // 30
        UNIT_SIZE: 5,
        UNIT_TO_CENTER: 20,
        UNITS_PER_REGION: 10,
        // TYPE_COLOR: ['#2D2B21', '#A69055', '#C9B086', '#FFB88C'],
        // STROKE_COLOR: '#141919',
        TYPE_COLOR: ['#5E5A38', '#A69055', '#C9B086', '#E5C47C'],
        STROKE_COLOR: '#3D3425',
        // OWNER_COLOR: ['#0cdbf8', '#05e200', '#f60', '#f65c7d', '#d92727', '#06c'],
        SELECTION_COLOR: '#D3D5DB',
        FADE_COLOR: '#3D3E40',
        OWNER_COLOR: ['#59BA32', '#F2DE49', '#8E8F94', '#125496', '#B82525', '#06c'],
        PLAYERS: {},
        LEFT: 10,
        TOP: 10,
        REGION_OVERLAY: 2
    },
    MY_ID: 0
};

// 3D3425 5E5A38 A69055 C9B086 E5C47C
// D3D5DB 70BA52 F2DF55 B83E3E 2D6296 7D7E82
// D3D5DB 59BA32 F2DE49 B82525 125496 8E8F94

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

// Raphael -----------------------------------------------

Raphael.fn.region = function(ID, pathString, center, units, regionType, ownerID) {
    var overlay = this.path(pathString).attr({opacity: 0});
    overlay.regionID = ID;
    
    var region = this.set(
        this.path(pathString), //.attr({opacity: 0}),
        this.circle(center.x, center.y, CONST.MAP.CENTER_SIZE),
        overlay
    ).attr({
        fill: CONST.MAP.TYPE_COLOR[regionType], 
        stroke: CONST.MAP.STROKE_COLOR, 
        'stroke-width': 2
    });
    
    region.center = center;
    region.regionID = ID;
    region.regionType = regionType;

    var that = this;
    region.update = function(units, ownerID) {
        this.units = units;
        this.ownerID = ownerID;
        
        if (this.units > CONST.MAP.UNITS_PER_REGION)
            this.units = CONST.MAP.UNITS_PER_REGION;
        
        if (this.items.length > 3)
            this.pop().remove();
        
        this.push(that.unitCircle(units, ownerID, center));
        this.items[CONST.MAP.REGION_OVERLAY].toFront();
    };
    region.update(units, ownerID);
    
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
                fill: CONST.MAP.PLAYERS[ownerID].color,
            })
        );
    }
    
    return unitCircle.scale(CONST.MAP.SCALE, CONST.MAP.SCALE, 0, 0);
};

Raphael.fn.arrow = function(origin, aim) {
    
    var vector1 = {x: origin.x - aim.x, y: origin.y - aim.y};
    var length = Math.sqrt(vector1.x * vector1.x + vector1.y * vector1.y);
    var vector2 = {x: 0, y: length};
    var arrowString = 'M' + aim.x + ' ' + (aim.y + 15) + 'l 5 10 -10 0 z v' + (length - 15);
    
    return this.path(arrowString).attr({
        stroke: CONST.MAP.SELECTION_COLOR, 
        fill: CONST.MAP.SELECTION_COLOR,
        'stroke-width': 2,
        rotation:
            Math.acos(
                (vector1.x * vector2.x + vector1.y * vector2.y) /
                (length * length)
            ) * 180 / Math.PI  * (vector1.x > 0 ? -1 : 1) + ' ' +
            aim.x  + ' ' +
            aim.y
    });
};

// UnitacsClient ----------------------------------------------

function UnitacsClient() {
};

UnitacsClient.prototype.onMessage = function(messageObject) {
    
    if (messageObject.mapData)
        this.map = new Map(messageObject.mapData);
    
    if (messageObject.listOfPlayersInGame)
        this.setPlayers(messageObject.listOfPlayersInGame);
        
    if (this.map) {
        if (messageObject.mapUpdate) {
            for (var i = 0, ii = messageObject.mapUpdate.length; i < ii; i++) {
                var update = messageObject.mapUpdate[i];
                this.map.regions[update.ID].update(update.units, update.ownerID);
            }
            this.map.reselect();
        }
        
        if (messageObject.moveUnits) {
            for (var i = 0, ii = messageObject.moveUnits.length; i < ii; i++) {
                var move = messageObject.moveUnits[i];
                this.map.createMove(move.departureID, move.destinationID, move.units, move.playerID, move.duration);
            }
        }
    }
};

UnitacsClient.prototype.setPlayers = function(playerList) {
    CONST.MAP.PLAYERS = {};
    
    for (var i = 0; i < playerList.length; i++) {
        CONST.MAP.PLAYERS[playerList[i].ID] = {
            name: playerList[i].name,
            color: CONST.MAP.OWNER_COLOR[i]
        };
    }
};

function Map(mapData) {
    this.height = mapData.height;
    this.width = mapData.width;
    this.adjacencyMatrix = mapData.adjacencyMatrix;
    this.routes = new Array();
    
    for (var i = 0; i < mapData.regions.length; i++) {
        this.routes[i] = new Array();
    }
    
    this.build(mapData.regions, mapData.adjacencyMatrix);
    
    var that = this;
    window.onresize = function() {
        that.resize();
    };
};

Map.prototype.build = function(regions, matrix) {
    this.paper = Raphael('map', this.width, this.height);
    this.regions = this.paper.set();
    this.paths = this.paper.set();
    this.moves = this.paper.set();
    
    for (var i = 0, ii = regions.length; i < ii; i++) {
        this.regions.push(
            this.paper.region(
                regions[i].ID, 
                regions[i].pathString, 
                regions[i].center, 
                regions[i].units, 
                regions[i].regionType, 
                regions[i].ownerID
            )
        );
    }
    
    for (var i = 0, ii = regions.length; i < ii; i++) {
        for (var j = i; j < ii; j++) {
            if (matrix[i][j] > 0)
                this.paths.push(
                    this.paper.path(
                        'M' + regions[i].center.x + 
                        ' ' + regions[i].center.y + 
                        'L' + regions[j].center.x + 
                        ' ' + regions[j].center.y
                    )
                );
        }
    }
    this.paths.attr({stroke: CONST.MAP.FADE_COLOR, 'stroke-width': 2, opacity: 0.5});
    
    this.mapSet = this.paper.set(
        this.paper.rect(0, 0, this.width, this.height).attr({fill: '#fff', opacity: 0}).toBack(),
        this.regions,
        this.paths,
        this.moves //this.paper.arrow({x: this.width-10, y: this.height-10}, {x: 10, y: 10})
    );
    
    this.initEvents();
    this.resize();
};

Map.prototype.initEvents = function(regions) {
    var that = this;
    this.mapSet.mousemove(function(event) {
        //FIXME: mouse-coordinates correspond to window not paper, offset needs to be determined
        that.mouse = {x: event.clientX - CONST.MAP.LEFT, y: event.clientY - CONST.MAP.TOP};
    });
    
    // this.mapSet.click(function(event) {
    //     console.log(event);
    // });
    
    var hoverIn = function(event) {
        that.hoverRegion = this.regionID;
        that.regions[this.regionID].items[0].attr({'fill-opacity': 0.5});
    },
    hoverOut = function(event) {
        that.regions[this.regionID].items[0].attr({'fill-opacity': 1});
    },
    mouseOut = function(event) {
        that.hoverRegion = -1
    };
    
    this.hoverRegions = function() {
        this.mapSet[0].toFront();
        this.regionsToFront();
        
        //this.regions.hover(hoverIn, hoverOut);
        //this.regions.mouseout(mouseOut);
    }
    
    this.unhoverRegions = function() {
        that.mapSet[0].toFront();
        
        // FIXME: unitdrag while update causes crash with following lines
        // that.regions.unhover(hoverIn, hoverOut);
        // that.regions.unmouseout(mouseOut);
    }
    
    this.regions.hover(hoverIn, hoverOut);
    this.regions.mouseout(mouseOut);
    this.unhoverRegions();
    
    this.initUnitSelection();
};

Map.prototype.initUnitSelection = function() {
    var that = this;
    this.rectIndex = 0;
    this.reselected = false;
    
    // FIXME: make selectionSet to own Object not Raphael.set
    this.selectionSet = this.paper.set();
    
    // FIXME: arrows appear not until movement
    var selectionStart = function () { 
        // console.log("selstart");     
        that.hoverRegions();
        that.reselected = false;
    },
    // FIXME: hover over a arrow causes hoverRegion to blink, atm solved throw distance to mousepointer
    selectionMove = function (dx, dy) {
        // console.log("selmove");
        
        if (that.reselected)
            selectionStart();
        
        if (that.selectionSet.length < 2)
            return;
        
        if (that.selectionSet.length > 2)
            that.selectionSet.pop().remove();
        
        var arrowSet = that.paper.set();
        
        for (var i = 0, ii = that.selectionSet[1].length; i < ii; i++) {
            var id = that.selectionSet[1][i].regionID;
            var origin = that.regions[id].center;
            origin = {x: origin.x * CONST.MAP.SCALE, y: origin.y * CONST.MAP.SCALE};
            
            // no snapping
            var arrow = that.paper.arrow(origin, that.mouse);
            
            // snapping
            // if (that.hoverRegion >= 0) {
            //     var aim = that.regions[that.hoverRegion].center;
            //     aim = {x: aim.x * CONST.MAP.SCALE, y: aim.y * CONST.MAP.SCALE};
            //     var arrow = that.paper.arrow(origin, aim);
            // }
            // else 
            //     continue;
            
            if (id == that.hoverRegion)
                arrow.attr({opacity: 0});
            
            arrowSet.push(arrow);
        }
        
        if (that.hoverRegion < 0)
            arrowSet.attr({fill: CONST.MAP.FADE_COLOR, stroke: CONST.MAP.FADE_COLOR});
        
        that.selectionSet.push(arrowSet);
    },
    selectionUp = function () {
        // console.log("selup");
        
        that.unhoverRegions();
        
        if (that.selectionSet.length < 2)
            return;
        
        if (that.selectionSet.length > 2)
            that.selectionSet.pop().remove();
        
        var moved = false;
        for (var i = 0, ii = that.selectionSet[1].length; i < ii; i++) {
            if (that.hoverRegion >= 0 && that.selectionSet[1][i].regionID != that.hoverRegion) {
                that.drawRoute(that.getRoute(that.selectionSet[1][i].regionID, that.hoverRegion));
                // FIXME: send moveData
                testSend({
                    move: {
                        route: that.getRoute(that.selectionSet[1][i].regionID, that.hoverRegion),
                        units: that.selectionSet[1][i].length
                    }
                });
                moved = true;
            }
        }
        
        if (moved)
            start();
        else
            that.selectionSet[0][that.rectIndex].toFront();
    };
    
    var start = function() {
        // console.log("start");
        this.o = {x: that.mouse.x, y: that.mouse.y};
        that.rectIndex = 0;
        
        while (that.selectionSet.length > 0)
            that.selectionSet.pop().remove();
    },
    move = function(dx, dy) {
        // console.log("move");
        while (that.selectionSet.length > 0)
            that.selectionSet.pop().remove();
        
        var ox, oy;
        (dx >= 0) ? (ox = this.o.x) : (ox = this.o.x + dx, dx *= -1);
        (dy >= 0) ? (oy = this.o.y) : (oy = this.o.y + dy, dy *= -1);
        
        that.selectionSet.push(
            that.paper.set(
                that.paper.rect(ox, oy, dx, dy).attr({fill: '#fff', opacity: 0}),
                that.paper.rect(ox, oy, dx, dy).attr({stroke: CONST.MAP.SELECTION_COLOR, 'stroke-width': 2})
            )
        );
    },
    up = function() {
        // console.log("up");
        if (that.selectionSet.length < 1)
            return;
            
        while (that.selectionSet.length > 1) {
            that.selectionSet.pop().remove();
        }
        
        var rect = that.selectionSet[0][that.rectIndex].getBBox();
        var unitSet = that.paper.set();
        
        for (var i = 0, ii = that.regions.length; i < ii; i++) {
            var region = that.regions[i];
            
            // FIXME: need my ID
            if (region.ownerID == CONST.MY_ID && region.units > 0) {
                var regionUnitSet = that.paper.set();
                
                for (var j = 0, jj = region[3].length; j < jj; j++) {
                    var unit = region[3][j];
                    
                    if (unit.attr('cx') > rect.x && unit.attr('cx') < rect.x + rect.width && 
                        unit.attr('cy') > rect.y && unit.attr('cy') < rect.y + rect.height)
                            regionUnitSet.push(unit.clone());
                }
                
                if (regionUnitSet.length > 0) {
                    regionUnitSet.regionID = region.regionID;
                    unitSet.push(regionUnitSet);
                }
                else 
                    regionUnitSet.remove();
            }
        }
        if (unitSet.length > 0) {
            that.selectionSet.push(unitSet.attr({fill: CONST.MAP.SELECTION_COLOR}));
            that.selectionSet[0][that.rectIndex].drag(selectionMove, selectionStart, selectionUp);
            that.selectionSet[0][that.rectIndex].toFront();
        }
        else {
            unitSet.remove();
            that.selectionSet[0][that.rectIndex].toBack();
        }
    };
    this.mapSet.drag(move, start, up);
    
    this.reselect = function() {
        
        if (this.selectionSet.length > 1) {
            var rect = this.selectionSet[0][0].getBBox();
            this.selectionSet[0][this.rectIndex].toBack();
            this.rectIndex = this.selectionSet[0].length;
            this.selectionSet[0].push(this.paper.rect(rect.x, rect.y, rect.width, rect.height).attr({fill: '#fff', opacity: 0}));
            this.reselected = true;
        }
        
        if (this.selectionSet.length && this.selectionSet[0].length > 1)
            up();
    };
};

Map.prototype.regionsToFront = function() {
    for (var i = 0, ii = this.regions.length; i < ii; i++) {
        this.regions[i][CONST.MAP.REGION_OVERLAY].toFront();
    }
};

Map.prototype.drawRoute = function(route) {
    var pathString = 'M ' + this.regions[route[0]].center.x + ' ' + this.regions[route[0]].center.y + 'L';
    
    for (var i = 1, ii = route.length; i < ii; i++) {
        pathString += ' ' + this.regions[route[i]].center.x + ' ' + this.regions[route[i]].center.y;
    }
    
    this.paths.push(
        this.paper.path(pathString).attr({
            stroke: CONST.MAP.SELECTION_COLOR, 
            'stroke-width': 2, 
            scale: (CONST.MAP.SCALE + ' ' + CONST.MAP.SCALE + ' ' + 0 + ' ' + 0)
        })
    );
};

Map.prototype.getRoute = function(departureID, destinationID) {
    if (this.routes[departureID].length != 0)
        return this.routes[departureID][destinationID];
    else {
        var dijkstra = new Dijkstra(this.adjacencyMatrix, departureID);
        var predecessors = dijkstra.getPredecessors();
        
        for (var i = 0; i < this.regions.length; i++) {
            if (i != departureID) {
                var route = new Array();
                var node = i;
                
                route.push(i);
                
                while (predecessors[node] != undefined) {
                    route.unshift(predecessors[node]);
                    node = predecessors[node];
                }
                
                this.routes[departureID][i] = new Array();
                this.routes[departureID][i] = route;
            }
        }
        
        return this.routes[departureID][destinationID];
    }    
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
        
        // FIXME: do eventListeners of removed Objects have to be removed?, same at Map.initUnitSelection.start()
        // this.selectionSet.undrag();
        while (this.selectionSet.length > 0) {
            this.selectionSet.pop().remove();
        }
    }
};

Map.prototype.createMove = function(departureID, destinationID, units, playerID, duration) {
    // FIXME: necesarry?
    if (departureID == destinationID || units == 0)
        return;
    
    var translation = {x: (this.regions[destinationID].center.x - this.regions[departureID].center.x) * CONST.MAP.SCALE, 
                        y: (this.regions[destinationID].center.y - this.regions[departureID].center.y) * CONST.MAP.SCALE};
    
    // FIXME move misses destination after resize
    this.moves.push(
        this.paper.unitCircle(units, playerID, this.regions[departureID].center).animate(
            {translation: translation.x + " " + translation.y, rotation: 360},
            duration,
            (function(){this.remove()})
        )
    );
};

var client = new UnitacsClient();

function testSend(messageObject) {
    if (messageObject.move) {
        client.onMessage({
            moveUnits: [{
                departureID: messageObject.move.route[0], 
                destinationID: messageObject.move.route[1], 
                units: messageObject.move.units, 
                playerID: CONST.MY_ID,
                duration: 10000
                }]
        });
    }
};

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

function rand(minimum, maximum) {
    return Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
};