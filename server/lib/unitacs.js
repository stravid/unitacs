var sys = require('sys'),
    Game = require('./game'),
    MapGenerator = require('./mapgenerator/mapgenerator'),
    fs = require('fs'),
    Log = require('./log.js/log'),
    log = new Log(Log.DEBUG, fs.createWriteStream('serverlog.txt'));

function Unitacs(){
    log.info('Unitacs Instance Created');
    
    this.takenNames = [];
    this.games= [];
    
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
    var mapGenerator = new MapGenerator();
    
    mapGenerator.createHexagonPattern(500, 400, 20, false);
    mapGenerator.generate(30, 0.5, false);
    
    var map = mapGenerator.getMap();
    
    map = this.constructMap(map);
    
    var regionIDsPerType = [];
    
    regionIDsPerType[0] = [];
    regionIDsPerType[1] = [];
    regionIDsPerType[2] = [];
    regionIDsPerType[3] = [];
    
    for (var i = 0; i < map.regions.length; i++) {
        regionIDsPerType[map.regions[i].regionType].push(map.regions[i].ID);
    }
    
    map.regionIDsPerType = regionIDsPerType;
    
    var game = new Game(map);
    
    this.games.push(game);
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