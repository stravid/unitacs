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
        CHECKPOINT_SIZE: 10,
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
    
    for (var i = 0, ii = mapData.regions.length; i < ii; i++) {
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
    this.background = this.paper.rect(0, 0, this.width, this.height).attr({fill: '#fff', opacity: 0});
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
        this.background,
        this.regions,
        this.paths,
        this.moves //this.paper.arrow({x: this.width-10, y: this.height-10}, {x: 10, y: 10})
    );
    
    this.initUnitSelection();
    this.resize();
};

Map.prototype.setSelectionStatus = function(status) {
    this.selectionStatus = status;
    // console.log(status);
    
    var back = false,
        select = false;
    
    switch (status) {
        case 'empty':
            if (this.selectionRectangle) {
                this.selectionRectangle.remove();
                this.selectionRectangle = 0;
            }
        
        case 'rectangle':
            while (this.selectedUnits.length > 0) {
                this.selectedUnits.pop().remove();
            }
            back = true;
        
        case 'selected':
            select = true;
        
        case 'dragging':
            this.moveRoutes = new Array();
            this.checkPoints = new Array();
            this.routingPath = new Array();
        
        case 'routing':
            while (this.arrows.length > 0) {
                this.arrows.pop().remove();
            }
            
            while (this.paths.length > 0) {
                this.paths.pop().remove();
            }
            break;
        
        default:
            alert('error: false status parameter at Map.setSelectionStatus()');
            return;
    }
    
    if (back)
        this.background.toFront();
    else if (select) {
        this.background.toFront();
        this.selectionRectangle.toFront();
    }
    else {
        if (this.moveRoutes.length) {
            for (var i = 0, ii = this.moveRoutes.length; i < ii; i++) {
                if (this.moveRoutes[i].length > 1)
                    this.drawRoute(this.moveRoutes[i]);
            }
            
            if (this.routingPath.length > 1)
                this.drawRoute(this.routingPath);
                
            this.drawCheckPoints();
        }
        
        this.background.toFront();
        this.regionsToFront();
    }
};

Map.prototype.initUnitSelection = function(regions) {
    this.selectionRectangle = 0;
    this.selectedUnits = new Array();
    this.moveRoutes = new Array();
    this.arrows = new Array();
    this.checkPoints = new Array();
    this.routingPath = new Array();
    
    this.setSelectionStatus('empty');
    
    var that = this;
    var hoverIn = function(event) {
        that.hoverRegion = this.regionID;
        that.regions[this.regionID].items[0].attr({'fill-opacity': 0.5});
    },
    hoverOut = function(event) {
        that.regions[this.regionID].items[0].attr({'fill-opacity': 1});
    };
    this.regions.hover(hoverIn, hoverOut);
    
    var mouseOut = function(event) {
        that.hoverRegion = -1
    };
    this.regions.mouseout(mouseOut);
    
    // empty
    var backgroundStart = function() {
        // console.log("back start");
        
        if (that.selectionStatus != 'empty')
            that.setSelectionStatus('empty');
        
        this.o = {x: that.mouse.x, y: that.mouse.y};
    },
    backgroundMove = function(dx, dy) {
        // console.log("back move");
        
        if (that.selectionRectangle)
            that.selectionRectangle.remove();
        
        var ox, oy;
        (dx >= 0) ? (ox = this.o.x) : (ox = this.o.x + dx, dx *= -1);
        (dy >= 0) ? (oy = this.o.y) : (oy = this.o.y + dy, dy *= -1);
        
        that.selectionRectangle = that.paper.rect(ox, oy, dx, dy).attr({fill: '#fff', 'fill-opacity': 0, stroke: CONST.MAP.SELECTION_COLOR, 'stroke-width': 2});
    },
    backgroundUp = function() {
        // console.log("back up");
        
        if (!that.selectionRectangle) {
            that.setSelectionStatus('empty');
            return;
        }
        else if (that.selectionStatus == 'empty')
            that.setSelectionStatus('rectangle');
            
        while (that.selectedUnits.length > 0) {
            that.selectedUnits.pop().remove();
        }
        
        var rect = that.selectionRectangle.getBBox();
        
        for (var i = 0, ii = that.regions.length; i < ii; i++) {
            var region = that.regions[i];
            
            // FIXME: need my ID
            if (region.ownerID == CONST.MY_ID && region.units > 0) {
                var regionUnits = that.paper.set();
                
                for (var j = 0, jj = region[3].length; j < jj; j++) {
                    var unit = region[3][j];
                    
                    if (unit.attr('cx') > rect.x && unit.attr('cx') < rect.x + rect.width && 
                        unit.attr('cy') > rect.y && unit.attr('cy') < rect.y + rect.height)
                            regionUnits.push(unit.clone());
                }
                
                if (regionUnits.length > 0) {
                    regionUnits.regionID = region.regionID;
                    that.selectedUnits.push(regionUnits.attr({fill: CONST.MAP.SELECTION_COLOR}));
                }
                else
                    regionUnits.remove();
            }
        }
        
        if (that.selectedUnits.length > 0 && that.selectionStatus == 'rectangle') {
            that.selectionRectangle.drag(selectionMove, selectionStart, selectionUp);
            that.setSelectionStatus('selected');
        }
        else if (that.selectedUnits.length < 1)
            that.setSelectionStatus('rectangle');
    };
    this.background.drag(backgroundMove, backgroundStart, backgroundUp);
    
    // selected
    // FIXME: arrows appear not until movement
    var selectionStart = function () {
        // console.log("select start");
        
        if (that.selectionStatus != 'dragging')
            that.setSelectionStatus('dragging');
    },
    // FIXME: hover over a arrow causes hoverRegion to blink, atm solved throw distance to mousepointer
    selectionMove = function (dx, dy) {
        // console.log("select move");
        
        if (that.selectedUnits.length < 1)
            return;
        
        if (that.selectionStatus != 'dragging')
            that.setSelectionStatus('dragging');
        
        while (that.arrows.length > 0) {
            that.arrows.pop().remove();
        }
        
        for (var i = 0, ii = that.selectedUnits.length; i < ii; i++) {
            var id = that.selectedUnits[i].regionID;
            var origin = that.regions[id].center;
            origin = {x: origin.x * CONST.MAP.SCALE, y: origin.y * CONST.MAP.SCALE};
            
            var arrow = that.paper.arrow(origin, that.mouse);
            
            if (id == that.hoverRegion)
                arrow.attr({opacity: 0});
            
            if (that.hoverRegion < 0)
                arrow.attr({fill: CONST.MAP.FADE_COLOR, stroke: CONST.MAP.FADE_COLOR});
            
            that.arrows.push(arrow);
        }
    },
    selectionUp = function () {
        // console.log("select up");
        
        if (that.selectedUnits.length < 1) {
            that.setSelectionStatus('rectangle');
            return;
        }
        
        if (that.selectionStatus != 'dragging')
            that.setSelectionStatus('dragging');
        
        var routing = false;
        for (var i = 0, ii = that.selectedUnits.length; i < ii; i++) {
            if (that.hoverRegion >= 0) {
                if (that.selectedUnits[i].regionID == that.hoverRegion)
                    that.moveRoutes.push([that.hoverRegion]);
                else {
                    that.moveRoutes.push(that.getRoute(that.selectedUnits[i].regionID, that.hoverRegion));
                    routing = true;
                }
            }
        }
        
        if (routing) {
            that.checkPoints.push(that.hoverRegion);
            that.routingPath.push(that.hoverRegion);
            that.setSelectionStatus('routing');
        }
        else
            that.setSelectionStatus('selected');
    };
    
    // routing
    this.mapSet.mousemove(function(event) {
        //FIXME: mouse-coordinates correspond to window not paper, offset needs to be determined
        that.mouse = {x: event.clientX - CONST.MAP.LEFT, y: event.clientY - CONST.MAP.TOP};
        
        if (that.selectionStatus == 'routing') {
            if (that.arrows.length)
                that.arrows.pop().remove();
            
            var id = that.checkPoints[that.checkPoints.length-1];
            var origin = that.regions[id].center;
            origin = {x: origin.x * CONST.MAP.SCALE, y: origin.y * CONST.MAP.SCALE};
            
            var arrow = that.paper.arrow(origin, that.mouse);
            
            if (id == that.hoverRegion)
                arrow.attr({opacity: 0});
            else if (that.hoverRegion < 0)
                arrow.attr({fill: CONST.MAP.FADE_COLOR, stroke: CONST.MAP.FADE_COLOR});
            
            that.arrows.push(arrow);
        }
    });
    
    // FIXME: subpress contextmenu
    this.mapSet.mousedown(function(event) {
        if (event.button == 2)
            that.setSelectionStatus('empty');
    });
    
    // FIXME: click on outside is interpreted as backgroundStart()-drag
    this.regions.click(function(event) {
        if (that.selectionStatus == 'routing' && that.hoverRegion >= 0) {
            
            if (that.selectedUnits.length != that.moveRoutes.length) {
                alert("error: regions.click: unequal number of selectedUnits and moveRoutes");
                return;
            }
            
            if (that.hoverRegion == that.checkPoints[that.checkPoints.length-1]) {
                that.startMoves();
                that.setSelectionStatus('empty');
            }
            else {
                var index = that.checkPoints.indexOf(that.hoverRegion);
                if (index != -1) {
                    that.changeCheckPoint(index);
                    that.setSelectionStatus('routing');
                    console.log('checkpoint');
                    console.log(that.checkPoints);
                    console.log(that.routingPath);
                    return;
                }
                
                index = that.routingPath.indexOf(that.hoverRegion);
                if (index != -1) {
                    that.changePath(index);
                    that.setSelectionStatus('routing');
                    console.log('path');
                    console.log(that.checkPoints);
                    console.log(that.routingPath);
                    return;
                }
                
                if (that.checkMoveRoutes()) {
                    selectionUp();
                    console.log('new start');
                    console.log(that.checkPoints);
                    console.log(that.routingPath);
                    return;
                }
                
                var node = that.routingPath.pop();
                that.routingPath = that.routingPath.concat(that.getRoute(node, that.hoverRegion));
                that.checkPoints.push(that.hoverRegion);
                
                that.setSelectionStatus('routing');
                
                console.log('new point');
                console.log([node, that.hoverRegion]);
                console.log(that.getRoute(node, that.hoverRegion));
                console.log(that.checkPoints);
                console.log(that.routingPath);
            }
        }
    });
    
    this.reselect = function() {
        
        if (this.selectionStatus != 'empty')
            backgroundUp();
        
        if (this.selectionStatus == 'routing') {
            var savedCheckPoints = this.checkPoints;
            this.hoverRegion = this.checkPoints[0];
            selectionUp();
            
            for (var i = 1, ii = savedCheckPoints.length; i < ii; i++) {
                var node = this.routingPath.pop();
                this.routingPath = this.routingPath.concat(this.getRoute(node, savedCheckPoints[i]));
            }
            this.checkPoints = savedCheckPoints;
        }
        this.setSelectionStatus(this.selectionStatus);
    };
};

Map.prototype.regionsToFront = function() {
    for (var i = 0, ii = this.regions.length; i < ii; i++) {
        this.regions[i][CONST.MAP.REGION_OVERLAY].toFront();
    }
};

Map.prototype.startMoves = function() {
    this.routingPath.shift();
    
    for (var i = 0, ii = this.moveRoutes.length; i < ii; i++) {
        var route = this.moveRoutes[i].concat(this.routingPath);
        if (route.length > 1) {
            // FIXME: send moveData
            testSend({move: {
                route: route,
                units: this.selectedUnits[i].length
            }});
        }
    }
};

Map.prototype.changeCheckPoint = function(index) {
    if (index == 0) {
        this.checkPoints.shift();
        var first = this.checkPoints[0];
        
        for (var i = 0, ii = this.moveRoutes.length; i < ii; i++) {
            if (this.selectedUnits[i].regionID == first)
                this.moveRoutes[i] = [first];
            else
                this.moveRoutes[i] = this.getRoute(this.selectedUnits[i].regionID, first);
        }
        
        index = this.routingPath.indexOf(first);
        this.routingPath = this.routingPath.slice(index);
    }
    else {
        this.checkPoints.splice(index, 1);
        var front = this.routingPath.indexOf(this.checkPoints[index-1]) + 1;
        var back = this.routingPath.indexOf(this.checkPoints[index]);
        
        var route = this.getRoute(this.checkPoints[index-1], this.checkPoints[index]);
        route.shift(); route.pop();
        
        if (route.length)
            this.routingPath = this.routingPath.slice(0, front).concat(route, this.routingPath.slice(back));
        else
            this.routingPath.splice(front, back-front);
    }
};

Map.prototype.changePath = function(index) {
    this.routingPath = this.routingPath.slice(0, index+1);
    
    var node = this.checkPoints.pop();
    while (this.routingPath.indexOf(node) == -1) {
        node = this.checkPoints.pop();
    }
    
    this.checkPoints.push(node);
    this.checkPoints.push(this.hoverRegion);
};

Map.prototype.checkMoveRoutes = function() {
    for (var i = 0, ii = this.moveRoutes.length; i < ii; i++) {
        for (var j = 0, jj = this.moveRoutes[i].length - 1; j < jj; j++) {
            if (this.hoverRegion == this.moveRoutes[i][j])
                return true;
        }
    }
    return false;
};

Map.prototype.drawCheckPoints = function() {
    var points = this.paper.set();
    
    for (var i = 0, ii = this.checkPoints.length; i < ii; i++) {
        var c = this.regions[this.checkPoints[i]].center;
        points.push(this.paper.circle(c.x, c.y, CONST.MAP.CHECKPOINT_SIZE));
    }
    
    this.paths.push(
        points.attr({
            stroke: CONST.MAP.SELECTION_COLOR, 
            'stroke-width': 2, 
            scale: (CONST.MAP.SCALE + ' ' + CONST.MAP.SCALE + ' ' + 0 + ' ' + 0)
        })
    );
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
        
        if (this.selectionStatus != 'empty') {
            this.reselect();
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
            
            if (this.distance[u] == Infinity) {
                console.log('error: dijkstra: node without connection');
                break;
            }
            
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