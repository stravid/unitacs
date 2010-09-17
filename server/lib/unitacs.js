var sys = require('sys'),
    Game = require('./lib/game');

function Unitacs(){
    sys.puts('Unitacs');
    
    this.takenNames = [];
    this.games= [];
    
    this.createNewGame();
};

Unitacs.prototype.handleData = function(data, client) {
    sys.puts(sys.inspect(data));
    
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
Unitacs.prototype.createNewGame = function() {
    var game = new Game();
};

Unitacs.prototype.addPlayerToGame = function(client) {
    if (this.games[this.games.length - 1].isLive) {
        this.createNewGame();    
    }
    
    this.games[this.games.length - 1].addPlayer(client);
};

Array.prototype.contains = function(item, from) {
    return this.indexOf(item, from) != -1;
};

module.exports = Unitacs;