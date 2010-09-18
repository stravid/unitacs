var sys = require('sys');

function Game() {
    sys.puts('Game');
    
    this.isLive = false;
    this.players = [];
    this.startTimeoutID;
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
            this.startTimeoutID = setTimeout(function() {
                var that = this;
                
                // IMPLEMENT: start()
                that.broadcast({chat: {name: 'God', message: 'Hi.'}});
            }, 60000);
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