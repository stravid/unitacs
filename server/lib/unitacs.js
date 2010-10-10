var sys = require('sys'),
    Game = require('./game'),
    MapGenerator = require('./mapgenerator/mapgenerator'),
    fs = require('fs'),
    Log = require('./log.js/log'),
    log = new Log(Log.DEBUG);
    //log = new Log(Log.DEBUG, fs.createWriteStream('../serverlog.txt'));

function Unitacs(){
    log.info('Unitacs Instance Created');
    
    this.takenNames = [];
    this.games= [];
    this.generator = new MapGenerator();
    
    this.createNewGame();
};

Unitacs.prototype.handleData = function(data, client) {
    if (client.name) {
        log.debug(client.name + ' sent: ' + sys.inspect(data));
    }

    if (data.name) {
        if (this.takenNames.contains(data.name)) {
            client.send({isNameTaken: true});
        } else {
            client.name = data.name;
            this.takenNames.push(data.name);
            this.addPlayerToGame(client);
        }
    } else {
        client.game.handleData(data, client);
    }
};

// IMPLEMENT: gameConfig
// FIXME: no hardcoded constants
Unitacs.prototype.createNewGame = function() {
    var regionIDsPerType = [],
        map;
    
    this.generator.createHexagonPattern(500, 400, 20, false);
    this.generator.generate(30, 0.5, false);
    
    map = this.constructMap(this.generator.getMap());
    
    regionIDsPerType[0] = [];
    regionIDsPerType[1] = [];
    regionIDsPerType[2] = [];
    regionIDsPerType[3] = [];
    
    for (var i = 0; i < map.regions.length; i++) {
        regionIDsPerType[map.regions[i].regionType].push(map.regions[i].ID);
    }
    
    map.regionIDsPerType = regionIDsPerType;

    this.games.push(new Game(map));
};

Unitacs.prototype.addPlayerToGame = function(client) {
    if (this.games[this.games.length - 1].isLive) {
        this.createNewGame();    
    }
    
    this.games[this.games.length - 1].addPlayer(client);
};

Unitacs.prototype.constructMap = function(map) {
    var regionIDs = [],
        unusedRegionIDs = [],
        newBaseID,
        numberOfBases = Math.ceil(map.regions.length / 4),
        neighborIDs;
    
    // FIXME: discuss how to procced with ownerID, change in ownerName? client rewrite?
    
    for (var i = 0; i < map.regions.length; i++) {
          map.regions[i].ownerID = -1;
          map.regions[i].units = 0;
          regionIDs[i] = i;
    }
    
    regionIDs.shuffle();
        
    for (var i = 0; i < numberOfBases; i++) {
        if (regionIDs.length > 0) {
            newBaseID = regionIDs.pop();
            neighborIDs = map.regions[newBaseID].neighborIDs;
            
            for (var j = 0; j < neighborIDs.length; j++) {
                if (regionIDs.contains(neighborIDs[j])) {
                    unusedRegionIDs = unusedRegionIDs.concat(regionIDs.splice(regionIDs.indexOf(neighborIDs[j]), 1));
                }
            }
        } else {
            log.warning('Base is connected with other base');
            unusedRegionIDs.shuffle();
            newBaseID = unusedRegionIDs.shift();
        }
        
        map.regions[newBaseID].regionType = 0;
    }

    unusedRegionIDs = unusedRegionIDs.concat(regionIDs);
    
    for (var i = 0; i < unusedRegionIDs.length; i++) {
        map.regions[unusedRegionIDs[i]].regionType = i % 3 + 1;
    }

    if (true) {
        map = {};

        map.regions = [
            {
                ID: 0,
                neighborIDs: [1],
                regionType: 1,
                ownerID: -1,
                units: 0
            },
            {
                ID: 1,
                neighborIDs: [0, 2, 4, 5],
                regionType: 0,
                ownerID: -1,
                units: 0
            },
            {
                ID: 2,
                neighborIDs: [1, 3, 5],
                regionType: 2,
                ownerID: -1,
                units: 0
            },
            {
                ID: 3,
                neighborIDs: [2],
                regionType: 2,
                ownerID: -1,
                units: 0
            },
            {
                ID: 4,
                neighborIDs: [1, 5, 7],
                regionType: 3,
                ownerID: -1,
                units: 0
            },
            {
                ID: 5,
                neighborIDs: [1, 2, 4, 6, 7, 8],
                regionType: 1,
                ownerID: -1,
                units: 0
            },
            {
                ID: 6,
                neighborIDs: [5, 8, 9, 10],
                regionType: 0,
                ownerID: -1,
                units: 0
            },
            {
                ID: 7,
                neighborIDs: [4, 5, 8],
                regionType: 0,
                ownerID: -1,
                units: 0
            },
            {
                ID: 8,
                neighborIDs: [5, 6, 7, 10, 11],
                regionType: 1,
                ownerID: -1,
                units: 0
            },
            {
                ID: 9,
                neighborIDs: [6, 10],
                regionType: 3,
                ownerID: -1,
                units: 0
            },
            {
                ID: 10,
                neighborIDs: [6, 8, 9, 11],
                regionType: 3,
                ownerID: -1,
                units: 0
            },
            {
                ID: 11,
                neighborIDs: [8, 10],
                regionType: 2,
                ownerID: -1,
                units: 0
            }
        ];
    }
    
    return map;
};

Array.prototype.contains = function(item, from) {
    return this.indexOf(item, from) != -1;
};

Array.prototype.shuffle = function() { 
    var i = this.length; 
    
    if (i < 2)
        return false;
        
    do { 
        var zi = Math.floor(Math.random() * i); 
        var t = this[zi];
         
        this[zi] = this[--i];
        this[i] = t; 
    } while (i) 
    
    return true;
};

function rand(minimum, maximum) {
    return Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
};

module.exports = Unitacs;