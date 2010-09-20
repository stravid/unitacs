var sys = require('sys');

function Game(map) {
    sys.puts('Game');
    
    this.map = map;
    this.isLive = false;
    this.players = [];
    this.startTimeoutID;
    this.timeOfStart;
    this.secondsUntilStart = 60;

    this.standardUnits = 5;
    this.standardTime = 15;
    this.standardSpeed = 25;

    this.weightOfARegionOnUnits = 1;
    this.weightOfARegionOnTime = -3;
    this.weightOfARegionOnSpeed = 5;
};

Game.prototype.addPlayer = function(client) {
    sys.puts('Player added');
    
    this.players.push(client);
    client.game = this;

    // FIXME: test
    client.unitInterval = function() {
        var that = this;
        
        that.intervalID = setInterval(function() {
            that.game.handleInterval(that);
        }, 5000);   
    };
    
    client.send({map: this.map});
    
    this.action({
        route: [this.map.regionIDsPerType[0][this.players.length - 1]],
        ownerID: client.name,
        units: 5
    });
    
    // IMPLEMENT: update player list
    
    if (this.players.length == 4) {
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

Game.prototype.handleData = function(data, client) {
    // IMPLEMENT: logic
    if (data.message) {
        this.handleMessage(data.message, client.name);
    }
    
    if (data.move) {
        this.handleMove(data.move);      
    }  
};

Game.prototype.start = function() {
    this.isLive = true; 
};


// FIXME: better solution
// FIXME: test cases with sys.puts()
Game.prototype.action = function(move) {
    var regionOwner = this.map.regions[move.route[0]].ownerID;

    if (move.route.length > 1) {
        if (regionOwner != move.ownerID && regionOwner != -1) {
            var attackerUnits = move.units;

            move.units -= this.map.regions[move.route[0]].units;
            this.map.regions[move.route[0]].units -= attackerUnits;

            if (move.units > 0) {
                this.updateRegion(move.route[0], -1, 0);
                this.handleMove(move);
            } else if (this.map.regions[move.route[0]].units > 0) {
                this.updateRegion(move.route[0], regionOwner, 0);
            } else {
                this.updateRegion(move.route[0], -1, 0);
            }
        } else {
            this.handleMove(move);
        }
    } else {
        if (regionOwner != move.ownerID && regionOwner != -1) {
            var attackerUnits = move.units;

            move.units -= this.map.regions[move.route[0]].units;
            this.map.regions[move.route[0]].units -= attackerUnits;

            if (move.units > 0) {
                this.updateRegion(move.route[0], move.ownerID, move.units);
            } else if (this.map.regions[move.route[0]].units > 0) {
                this.updateRegion(move.route[0], regionOwner, 0);
            } else {
                this.updateRegion(move.route[0], -1, 0);
            }
        } else {
            this.updateRegion(move.route[0], move.ownerID, move.units);
        }
    }
};

Game.prototype.updateRegion = function(regionID, newOwnerID, unitChange) {
    if (this.map.regions[regionID].ownerID == -1) {
        if (newOwnerID != -1) {
            // player gets country
        }
    } else {
        if (this.map.regions[regionID].ownerID != newOwnerID) {
            // player gets country
        } else {
            // player reinforces country
        }
    }
};

Game.prototype.handleInterval = function(client) {
    sys.puts(client.name);
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
        
        // IMPLEMENT: optical move
       move.route.shift(); 
        
        var closureMove = move;
        var that = this;
        
        setTimeout(function() {
            sys.puts(sys.inspect(closureMove));
            that.action(closureMove);
        }, 5000);
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