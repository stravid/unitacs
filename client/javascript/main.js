// constants -----------------------------------------------
var CONST = {
    MAP: {
        WIDTH: 1024,
        HEIGHT: 640,
        VIEWPORT_WIDTH_VARIANCE: 20,
        VIEWPORT_HEIGHT_VARIANCE: 30
    }
};

var countryData = [                  
                    ["Alaska", "M 54.1 172.101 L 38.899 136.101 L 70.1 97.701 L 114.1 104.101 L 128.5 174.5 L 89.299 160.101 Z", 70, 150, -1, 0, false, 0,0],
                    ["Northwest Territory", "M 123.72 151.132 L 114.1 104.101 L 206.1 67.3 L 243.7 96.9 L 231.7 156.9 Z", 170, 130, -1, 0, false, 0,0],
                    ["Quebec", "M 231.7 156.9 L 274.1 180.101 L 294.899 222.9 L 331.3 222.9 L 358.1 196.101 L 327.7 165.701 L 319.7 112.101 L 270.899 86.5 L 243.7 96.9 Z", 260, 150, -1, 0, false, 0,0],
                    ["Greenland", "M 301.927 76.273 L 348.327 111.473 L 359.527 178.673 L 387.527 142.673 L 445.928 109.073 L 457.928 51.473 L 385.127 37.073 Z", 370, 100, -1, 0, false, 0,0],
                    ["Ontario", "M 270.1 236.9 L 294.899 222.9 L 274.1 180.101 L 231.7 156.9 L 217.298 156.131 L 211.7 207.3 L 242.899 212.101 Z", 230, 210, -1, 0, false, 0,0],
                    ["Alberta", "M 211.7 207.3 L 146.899 207.3 L 128.5 174.5 L 123.72 151.132 L 217.298 156.131 Z", 140, 200, -1, 0, false, 0,0],
                    ["Western United States", "M 146.899 207.3 L 211.7 207.3 L 232.62 210.519 L 229.299 252.9 L 190.899 283.3 L 146.1 270.5 L 138.1 243.3 Z", 160, 260, -1, 0, false, 0,0],
                    ["Eastern United States", "M 190.899 283.3 L 200.1 292.5 L 250.1 284.101 L 331.3 222.9 L 294.899 222.9 L 270.1 236.9 L 242.899 212.101 L 232.62 210.519 L 229.299 252.9 Z", 240, 280, -1, 0, false, 0,0],
                    ["Central America", "M 146.1 270.5 L 190.899 283.3 L 200.1 292.5 L 232.5 352.101 L 227.7 363.301 L 197.3 332.9 L 170.899 320.101 Z", 170, 320, -1, 0, false, 0,0],
                    ["Venezuela", "M 232.5 352.101 L 258.899 341.7 L 325.299 373.7 L 305.299 384.101 L 251.7 400.101 L 226.1 385.7 L 227.7 363.301 Z", 240, 400, -1, 0, false, 0,1],
                    ["Brazil", "M 325.299 373.7 L 334.1 392.902 L 380.5 409.702 L 362.1 479.302 L 326.5 514.902 L 314.1 502.503 L 308.5 457.702 L 250.1 423.302 L 251.7 400.101 L 305.299 384.101 Z", 290, 440, -1, 0, false, 0,1],
                    ["Peru", "M 226.1 385.7 L 251.7 400.101 L 250.1 423.302 L 308.5 457.702 L 314.1 502.503 L 257.299 466.502 L 222.1 431.303 Z", 190, 460, -1, 0, false, 0,1],
                    ["Argentina", "M 326.5 514.902 L 286.899 569.702 L 298.899 622.502 L 258.1 597.702 L 257.299 466.502 L 314.1 502.503 Z", 260, 540, -1, 0, false, 0,1],
                    ["North Africa", "M 490.098 294.5 L 436.497 304.1 L 401.298 356.1 L 429.298 432.1 L 472.497 428.899 L 495.697 444.899 L 535.697 415.3 L 531.697 376.1 L 498.098 356.1 Z", 440, 380, -1, 0, false, 0,2],
                    ["Egypt", "M 492.092 309.855 L 570.098 323.3 L 576.497 359.3 L 531.697 376.1 L 498.098 356.1 Z", 500, 360, -1, 0, false, 0,2],
                    ["East Africa", "M 576.497 359.3 L 599.697 409.699 L 625.298 413.699 L 598.098 469.699 L 592.497 503.3 L 562.897 492.899 L 570.098 444.899 L 535.697 415.3 L 531.697 376.1 Z", 540, 420, -1, 0, false, 0,2],
                    ["Congo", "M 535.697 415.3 L 570.098 444.899 L 562.897 492.899 L 534.098 500.899 L 498.897 479.3 L 495.697 444.899 Z", 520, 470, -1, 0, false, 0,2],
                    ["South Africa", "M 498.897 479.3 L 518.897 607.3 L 554.098 603.3 L 592.497 503.3 L 562.897 492.899 L 534.098 500.899 Z", 520, 550, -1, 0, false, 0,2],
                    ["Madagascar", "M 622.897 508.1 L 594.897 536.1 L 594.897 573.699 L 631.697 559.3 Z", 640, 560, -1, 0, false, 0,2],
                    ["Western Europe", "M 459.697 228.899 L 427.697 260.899 L 424.497 284.899 L 439.298 292.899 L 472.897 277.299 L 476.497 240.899 Z", 455, 280, -1, 0, false, 0,3],
                    ["Southern Europe", "M 476.497 240.899 L 474.907 256.979 L 506.063 288.135 L 536.497 295.299 L 545.298 251.299 L 526.898 232.899 Z", 510, 280, -1, 0, false, 0,3],
                    ["Great Britain", "M 444.897 183.299 L 424.297 203.899 L 430.897 232.1 L 458.897 218.5 L 462.098 193.699 Z", 440, 230, -1, 0, false, 0,3],
                    ["Northern Europe", "M 459.697 228.899 L 479.697 202.5 L 514.897 202.5 L 526.898 232.899 L 476.497 240.899 Z", 480, 245, -1, 0, false, 0,3],
                    ["Russia", "M 514.897 202.5 L 542.098 177.699 L 542.098 116.899 L 586.098 138.5 L 640.497 120.899 L 652.497 180.899 L 606.098 217.699 L 614.897 279.299 L 545.298 251.299 L 526.898 232.899 Z", 560, 200, -1, 0, false, 0,3],
                    ["Scandinavia", "M 542.098 116.899 L 514.098 112.1 L 465.697 160.5 L 474.098 180.899 L 498.897 187.299 L 516.098 170.1 L 542.098 177.699 Z", 510, 160, -1, 0, false, 0,3],
                    ["Iceland", "M 423.697 140.1 L 406.897 157.699 L 416.098 166.899 L 436.497 158.5 Z", 400, 200, -1, 0, false, 0,3],
                    ["Ural", "M 640.497 120.899 L 662.897 101.699 L 713.298 189.699 L 722.897 235.299 L 713.298 235.299 L 652.497 180.899 Z", 660, 170, -1, 0, false, 0,4],
                    ["Afghanistan", "M 713.298 235.299 L 690.897 290.5 L 654.897 296.1 L 630.897 290.5 L 614.897 279.299 L 606.098 217.699 L 652.497 180.899 Z", 630, 250, -1, 0, false, 0,4],
                    ["Middle East", "M 654.897 296.1 L 662.897 344.899 L 616.497 329.699 L 657.298 363.3 L 646.098 383.3 L 607.697 400.899 L 573.504 342.462 L 570.098 323.3 L 536.497 295.299 L 545.298 251.299 L 614.897 279.299 L 630.897 290.5 Z", 580, 320, -1, 0, false, 0,4],
                    ["India", "M 690.897 290.5 L 717.297 316.899 L 757.298 328.899 L 762.098 353.699 L 721.298 420.1 L 690.897 363.3 L 662.897 344.899 L 654.897 296.1 Z", 710, 360, -1, 0, false, 0,4],
                    ["Siam", "M 757.298 328.899 L 780.497 328.899 L 813.298 360.899 L 827.697 388.899 L 814.098 440.1 L 790.098 408.1 L 762.098 353.699 Z", 780, 380, -1, 0, false, 0,4],
                    ["China", "M 813.298 360.899 L 845.298 348.899 L 856.497 307.3 L 832.497 268.1 L 722.897 235.299 L 713.298 235.299 L 690.897 290.5 L 717.297 316.899 L 757.298 328.899 L 780.497 328.899 Z", 740, 300, -1, 0, false, 0,4],
                    ["Mongolia", "M 735.524 239.078 L 745.298 218.5 L 815.697 218.5 L 853.298 212.899 L 858.098 265.699 L 832.497 268.1 Z", 830, 260, -1, 0, false, 0,4],
                    ["Japan", "M 882.098 204.899 L 895.697 260.1 L 879.697 298.5 L 890.098 308.899 L 917.897 291.1 L 917.897 248.1 Z", 930, 280, -1, 0, false, 0,4],
                    ["Irkutsk", "M 853.298 212.899 L 838.098 165.699 L 815.697 150.5 L 783.697 164.1 L 730.098 187.299 L 745.298 218.5 L 815.697 218.5 Z", 790, 210, -1, 0, false, 0,4],
                    ["Siberia", "M 662.897 101.699 L 717.298 76.899 L 782.098 93.699 L 768.497 122.5 L 783.697 164.1 L 730.098 187.299 L 745.298 218.5 L 735.524 239.078 L 722.897 235.299 L 713.298 189.699 Z", 710, 140, -1, 0, false, 0,4],
                    ["Yakutsk", "M 782.098 93.699 L 888.497 106.5 L 874.098 144.899 L 838.098 165.699 L 815.697 150.5 L 783.697 164.1 L 768.497 122.5 Z", 790, 140, -1, 0, false, 0,4],
                    ["Kamtchatka", "M 888.497 106.5 L 925.298 100.1 L 971.697 128.1 L 918.098 157.699 L 862.897 185.699 L 873.298 222.5 L 856.065 243.338 L 853.298 212.899 L 838.098 165.699 L 874.098 144.899 Z", 890, 150, -1, 0, false, 0,4],
                    ["Indonesia", "M 859.697 394.5 L 836.698 435.9 L 824.497 457.7 L 799.697 443.301 L 818.098 479.301 L 854.098 485.7 L 873.298 485.7 L 887.697 447.301 Z", 850, 460, -1, 0, false, 0,5],
                    ["New Guinea", "M 908.497 446.5 L 937.298 467.301 L 964.497 465.7 L 950.897 486.5 L 912.497 476.9 Z", 970, 490, -1, 0, false, 0,5],
                    ["Eastern Australia", "M 875.697 500.9 L 907.697 497.7 L 936.497 512.9 L 957.298 548.101 L 922.897 629.7 L 906.098 555.301 L 874.098 550.5 Z", 880, 540, -1, 0, false, 0,5],
                    ["Western Australia", "M 875.697 500.9 L 825.298 529.7 L 814.897 592.101 L 854.098 592.101 L 885.298 580.101 L 922.897 629.7 L 906.098 555.301 L 874.098 550.5 Z", 830, 570, -1, 0, false, 0,5]
                    ];

// Raphael -----------------------------------------------

Raphael.fn.country = function(id) {
    
    var shape = this.path(countryData[id][1]).attr({fill: Raphael.getColor(), stroke: '#777', 'stroke-width': 2});
    var txt = this.text(countryData[id][2], countryData[id][3], countryData[id][0]).attr({fill: '#777', 'font-size': 15});
    var overlay = this.path(countryData[id][1]).attr({fill: '#fff', opacity: 0});
    
    overlay.click(function(event) {
        shape.animate({fill: '#000'}, 500, '<');
    });
    
    overlay.hover(function(event) {
        shape.toFront().attr({stroke: '#fff'});
        txt.toFront().attr({fill: '#fff'});
        overlay.toFront();
    }, function(event) {
        shape.attr({stroke: '#777'});
        txt.attr({fill: '#777'});
    });
    
    return this.set(shape, txt, overlay);
}

// UnitacsClient ----------------------------------------------

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
    
    this.map = Raphael('map', CONST.MAP.WIDTH, CONST.MAP.HEIGHT);
    
    var countrySet = this.map.set();
    for (var i = 0, ii = countryData.length; i < ii; i++)
        countrySet.push(this.map.country(i));
    
    this.mapSet = this.map.set(
        this.map.rect(0, 0, CONST.MAP.WIDTH, CONST.MAP.HEIGHT).attr({stroke: "#fff", 'stroke-width': 2}),
        countrySet
    );
    
    this.resizeMap();
};

UnitacsClient.prototype.resizeMap = function() {
    console.log('map resized');
    
    var viewport = getViewport();
    viewport[0] -= CONST.MAP.VIEWPORT_WIDTH_VARIANCE;
    viewport[1] -= CONST.MAP.VIEWPORT_HEIGHT_VARIANCE;
    
    // this.map.setSize(viewport[0], viewport[1]);
    
    var scaleX = viewport[0] / CONST.MAP.WIDTH;
    var scaleY = viewport[1] / CONST.MAP.HEIGHT;
    var scale = (scaleX > scaleY) ? scaleY : scaleX;
    
    if (scale != 1) {
        this.mapSet.scale(scale, scale, 0, 0);
        this.map.setSize(CONST.MAP.WIDTH * scale, CONST.MAP.HEIGHT * scale);
    }
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