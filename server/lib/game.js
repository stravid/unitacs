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

module.exports = Game;