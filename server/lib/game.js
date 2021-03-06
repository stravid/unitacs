var sys = require('sys'),
    fs = require('fs'),
    Log = require('./log.js/log'),
    log = new Log(Log.DEBUG);
    //log = new Log(Log.DEBUG, fs.createWriteStream('../serverlog.txt'));

function Game(map) {
    log.info('Game Instance Created');
    
    this.map = map;
    this.isLive = false;
    this.players = [];
    this.startTimeoutID;
    this.timeOfStart;
    this.secondsUntilStart = 10;

    this.standardUnits = 2;
    this.standardTime = 60000;
    this.standardSpeed = 30;

    this.weightOfARegionOnUnits = 1;
    // FIXME: consider overflow
    this.weightOfARegionOnTime = -5000;
    this.weightOfARegionOnSpeed = 5;

    this.regionTypes = {
        BASE: 0,
        UNIT: 1,
        TIME: 2,
        SPEED: 3
    };
};

Game.prototype.addPlayer = function(client) {
    log.info(client.name + ' added to game');

    this.players.push(client);
    client.game = this;

    client.setUnitInterval = function() {
        var that = this;

        if (this.intervalID) {
            clearInterval(this.intervalID);
        }

        log.info('Interval of ' + this.name + ' set to ' + this.intervalReloadValue);

        this.intervalID = setInterval(function() {
            // FIXME: check if interval-time changed
            
            that.game.handleInterval(that);
        }, this.intervalReloadValue);

        this.intervalReloadValue = null;
    };

    client.init = function() {
        this.baseIDs = [];
        this.numberOfUnitRegions = 0;
        this.numberOfSpeedRegions = 0;
        this.numberOfTimeRegions = 0;
        this.intervalReloadValue = this.standardTime;
    };

    client.init();

    this.broadcast({listOfPlayersInGame: this.getPlayerList()});

    client.send({map: this.map});
    
    this.action({
        route: [this.map.regionIDsPerType[0][this.players.length - 1]],
        ownerID: client.name,
        units: 1
    });
        
    // FIXME: no constants
    if (this.players.length == 3) {
        this.start();
        clearTimeout(this.startTimeoutID);
    } else {
        if (this.players.length == 2) {
            var that = this;
            
            this.timeOfStart = new Date().getTime() + this.secondsUntilStart * 1000;
            this.broadcast({timeOfStart: this.timeOfStart});
            
            this.startTimeoutID = setTimeout(function() {
                that.start();
            }, this.secondsUntilStart * 1000);
        } else if (this.players.length != 1) {
            client.send({timeOfStart: this.timeOfStart});
        }
    }
};

Game.prototype.getPlayerList = function() {
    var result = [];
    
    for (var i = 0; i < this.players.length; i++) {
          result.push({name: this.players[i].name, ID: this.players[i].name});
    }  

    return result;
};

Game.prototype.handleData = function(data, client) {
    if (data.message) {
        this.handleMessage(data.message, client.name);
    }
    
    if (data.move) {
        // FIXME: only a hotfix since the client doesn't know who he is
        log.debug(sys.inspect(data.move));
        data.move.ownerID = client.name;
        this.handleMove(data.move);      
    }  
};

Game.prototype.start = function() {
    this.isLive = true;

    log.info('Game started');

    for (var i = 0; i < this.players.length; i++) {
        this.handleInterval(this.players[i]);
    }
};

// FIXME: better solution
// FIXME: test cases with sys.puts()
Game.prototype.action = function(move) {
    var regionOwner = this.map.regions[move.route[0]].ownerID;

    log.debug('Move: ' + sys.inspect(move));
    log.debug('Region');
    log.debug('ownerID: ' + regionOwner);
    log.debug('units: ' + this.map.regions[move.route[0]].units);

    if (move.route.length > 1) {
        log.debug('Multi move');

        if (regionOwner != move.ownerID && regionOwner != -1) {
            var attackerUnits = move.units;

            log.debug('Enemy Region');

            move.units -= this.map.regions[move.route[0]].units;
            this.map.regions[move.route[0]].units -= attackerUnits;

            if (move.units > 0) {
                log.debug('Attacker won, moves on');
                this.updateRegion(move.route[0], -1, 0);
                this.handleMove(move);
            } else if (this.map.regions[move.route[0]].units > 0) {
                log.debug('Defender won');
                this.updateRegion(move.route[0], regionOwner, 0);
            } else {
                log.debug('Both lost');
                this.updateRegion(move.route[0], -1, 0);
            }
        } else {
            log.debug('Neutral region');
            this.handleMove(move);
        }
    } else {
        log.debug('Final move');

        if (regionOwner != move.ownerID && regionOwner != -1) {
            var attackerUnits = move.units;

            log.debug('Enemy Region');

            move.units -= this.map.regions[move.route[0]].units;
            this.map.regions[move.route[0]].units -= attackerUnits;

            if (move.units > 0) {
                log.debug('Attacker won');
                this.updateRegion(move.route[0], move.ownerID, move.units);
            } else if (this.map.regions[move.route[0]].units > 0) {
                log.debug('Defender won');
                this.updateRegion(move.route[0], regionOwner, 0);
            } else {
                log.debug('Both lost');
                this.updateRegion(move.route[0], -1, 0);
            }
        } else {
            log.debug('Neutral region');
            this.updateRegion(move.route[0], move.ownerID, move.units);
        }
    }
};

// IMPLEMENT: max unit cap of a region
// FIXME: newOwnerID == -1
Game.prototype.updateRegion = function(regionID, newOwnerID, unitChange) {
    var regionType = this.map.regions[regionID].regionType,
        temporaryClient = this.getClientByName(newOwnerID),
        maximum;

    if (this.map.regions[regionID].ownerID == -1) {
        if (newOwnerID != -1) {
            if (regionType == this.regionTypes.BASE) {
                temporaryClient.baseIDs.push(regionID); 
            } else if (regionType == this.regionTypes.UNIT) {
                temporaryClient.numberOfUnitRegions++;
            } else if (regionType == this.regionTypes.TIME) {
                temporaryClient.numberOfTimeRegions++;

                // FIXME: units get lost
                temporaryClient.intervalReloadValue = (this.standardTime + this.weightOfARegionOnTime * temporaryClient.numberOfTimeRegions);
            } else if (regionType == this.regionTypes.SPEED) {
                temporaryClient.numberOfSpeedRegions++;
            }

            // set region
            this.map.regions[regionID].ownerID = newOwnerID;
            this.map.regions[regionID].units = unitChange;
        }
    } else {
        if (this.map.regions[regionID].ownerID != newOwnerID) {
            var oldClient = this.getClientByName(this.map.regions[regionID].ownerID);

            if (regionType == this.regionTypes.BASE) {
                temporaryClient.baseIDs.push(regionID);
                oldClient.baseIDs.splice(oldClient.baseIDs.indexOf(regionID), 1);
                
                log.debug('New Client: ' + sys.inspect(temporaryClient.baseIDs));
                log.debug('Old Client: ' + sys.inspect(oldClient.baseIDs));
            } else if (regionType == this.regionTypes.UNIT) {
                temporaryClient.numberOfUnitRegions++;
                oldClient.numberOfUnitRegions--;
            } else if (regionType == this.regionTypes.TIME) {
                temporaryClient.numberOfTimeRegions++;
                oldClient.numberOfTimeRegions--;

                // FIXME: units get lost
                temporaryClient.intervalReloadValue = (this.standardTime + this.weightOfARegionOnTime * temporaryClient.numberOfTimeRegions);
                oldClient.intervalReloadValue = (this.standardTime + this.weightOfARegionOnTime * old.numberOfTimeRegions);
            } else if (regionType == this.regionTypes.SPEED) {
                temporaryClient.numberOfSpeedRegions++;
                oldClient.numberOfSpeedRegions--;
            }

            this.map.regions[regionID].ownerID = newOwnerID;
            this.map.regions[regionID].units = unitChange;
        } else {
            this.map.regions[regionID].units += unitChange;
        }
    }

    this.broadcast({mapUpdate: [
        {
            ID: regionID,
            ownerID: newOwnerID,
            units: this.map.regions[regionID].units
        }
    ]});
};

Game.prototype.handleInterval = function(client) {
    var amountOfNewUnits = client.numberOfUnitRegions * client.game.weightOfARegionOnUnits + client.game.standardUnits,
        unitsPerBase = Math.floor(amountOfNewUnits / client.baseIDs.length),
        unitOverflow = amountOfNewUnits % client.baseIDs.length;

    for (var i = 0; i < client.baseIDs.length; i++) {
        // FIXME: dirty hack to remove overflow problem
        if (i == 0) {
            if (this.map.regions[client.baseIDs[i]].units + unitsPerBase + unitOverflow <= 10) {
                client.game.updateRegion(client.baseIDs[i], client.name, unitsPerBase + unitOverflow); 
            } else {
                client.game.updateRegion(client.baseIDs[i], client.name, 10 - this.map.regions[client.baseIDs[i]].units);
            }
        } else {
            if (this.map.regions[client.baseIDs[i]].units + unitsPerBase <= 10) {
                client.game.updateRegion(client.baseIDs[i], client.name, unitsPerBase); 
            } else {
                client.game.updateRegion(client.baseIDs[i], client.name, 10 - this.map.regions[client.baseIDs[i]].units);
            }
        }   
    }

    if (client.intervalReloadValue) {
        log.debug('HandleInterval calls setUnitInterval');
        client.setUnitInterval();
    }
};

Game.prototype.handleMove = function(move) {
    if (!this.areNeighbors(move.route, 0)) {
        return;
    }

    if (!this.isLive) {
        return;
    }
    
    if (this.map.regions[move.route[0]].ownerID == move.ownerID || this.map.regions[move.route[0]].ownerID == -1) {
        if (this.map.regions[move.route[0]].ownerID == move.ownerID) {
            if (this.map.regions[move.route[0]].units < move.units) {
                return;
            } else {
                this.updateRegion(move.route[0], move.ownerID, -move.units);
            }
        }
        
        var temporaryClient = this.getClientByName(move.ownerID),
            durationOfMove,
            speed;

        speed = this.standardSpeed + temporaryClient.numberOfSpeedRegions * this.weightOfARegionOnSpeed;
        durationOfMove = parseInt(parseFloat(this.map.adjacencyMatrix[move.route[0]][move.route[1]] / speed) * 1000);

        //sys.puts('Duration for move: ' + durationOfMove);

        this.broadcast({
            moveUnits: [{
                departureID: move.route[0],
                destinationID: move.route[1], 
                units: move.units,
                playerID: move.ownerID,
                duration: durationOfMove
                }]
        });

        move.route.shift(); 
        
        var closureMove = move;
        var that = this;
        
        setTimeout(function() {
            //sys.puts(sys.inspect(closureMove));
            that.action(closureMove);
        }, durationOfMove);
    }  
};

Game.prototype.areNeighbors = function(route, index) {
    if (index == route.length - 1) {
        return true;
    }

    if (this.map.regions[route[index]].neighborIDs.contains(route[index + 1])) {
        return this.areNeighbors(route, index + 1);
    } else {
        return false;
    }
};

Game.prototype.getClientByName = function(name) {
    for (var i = 0; i < this.players.length; i++) {
        if (this.players[i].name == name) {
            return this.players[i];
        }
    }
};

Game.prototype.handleMessage = function(message, name) {
    var responseObject = {
        name: name,
        message: message
    };
    
    this.broadcast({chat: responseObject});
};

Game.prototype.broadcast = function(object) {
    for (var i = 0; i < this.players.length; i++) {
        this.players[i].send(object);
    }
};

Array.prototype.contains = function(item, from) {
    return this.indexOf(item, from) != -1;
};

module.exports = Game;