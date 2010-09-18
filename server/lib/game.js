var sys = require('sys');

function Game(map) {
    sys.puts('Game');
    
    this.map = map;
    this.isLive = false;
    this.players = [];
    this.startTimeoutID;
    this.timeOfStart;
    this.secondsUntilStart = 60;
};

Game.prototype.addPlayer = function(client) {
    sys.puts('Player added');
    
    this.players.push(client);
    client.game = this;
    
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

Game.prototype.action = function(move) {
    var updateMapFlag = false;
    
    if (this.map.regions[move.route[0]].ownerID != move.ownerID && this.map.regions[move.route[0]].ownerID != -1) {
        move.units -= this.map.regions[move.route[0]].units;
        updateMapFlag = true;
    }
    
    if (move.units > 0) {
        if (move.route.length == 1) {
            // IMPLEMENT: update map
            updateMapFlag = true;
        } else {
            this.handleMove(move);
        }
    }
    
    if (updateMapFlag) {
        // IMPLEMENT: updateMap()
    }
};

Game.prototype.handleMove = function(move) {
    // IMPLEMENT: check if correct move
    // IMPLEMENT: only if live
    
    if (this.map.regions[move.route[0]].ownerID == move.ownerID || this.map.regions[move.route[0]].ownerID == -1) {
        if (this.map.regions[move.route[0]].ownerID == move.ownerID) {
            if (this.map.regions[move.route[0]].units < move.units) {
                return;
            } else {
                // IMPLEMENT: update map
                // IMPLEMENT: updateMap()
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

module.exports = Game;