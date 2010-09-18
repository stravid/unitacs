var sys = require('sys');

function Game() {
    sys.puts('Game');
    
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
    
    // IMPLEMENT: send map
    
    client.send({map: true});
    
    // IMPLEMENT: action(set base with X units)
    
    // IMPLEMENT: update player list
    
    if (this.players.length == 4) {
        // IMPLEMENT: start()
        clearTimeout(this.startTimeoutID);
    } else {
        if (this.players.length == 2) {
            var that = this;
            
            this.timeOfStart = new Date().getSeconds() + this.secondsUntilStart * 1000;
            this.broadcast({timeOfStart: this.timeOfStart});
            
            this.startTimeoutID = setTimeout(function() {
                // IMPLEMENT: start()
                that.broadcast({chat: {name: 'God', message: 'Hi.'}});
            }, this.secondsUntilStart * 1000);
        }
    }
};

Game.prototype.handleData = function(data, client) {
    // IMPLEMENT: logic
    if (data.message) {
        this.handleMessage(data.message, client.name);
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