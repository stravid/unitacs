var sys = require('sys');

function Game() {
    sys.puts('Game');
    
    this.isLive = false;
    this.players = [];
};

Game.prototype.addPlayer = function(client) {
    sys.puts('Player added');
    
    // IMPLEMENT: logic
};

Game.prototype.handleData = function(data, client) {
    // IMPLEMENT: logic
    if (data.message) {
        this.handleMessage(data.message, client.name);
    }  
};

Game.prototype.handleMessage(message, name) {
    var responseObject {
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