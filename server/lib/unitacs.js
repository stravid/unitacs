var sys = require('sys');

function Unitacs(){
    sys.puts('Unitacs');
    
    this.takenNames = [];
    this.games= [];
};

Unitacs.prototype.handleData = function(data, client) {
    sys.puts(sys.inspect(data));
    
    client.send(data);
    
    if (data.name) {
        if (this.takenNames.contains(data.name)) {
            client.send({isNameTaken: true});
        } else {
            client.name = data.name;
            this.takenNames.push(data.name);
            // IMPLEMENT: this.addPlayerToGame()
        }
    } else {
        // IMPLEMENT: client.game.handleData(data, client)
    }
};

Array.prototype.contains = function(item, from) {
    return this.indexOf(item, from) != -1;
};

module.exports = Unitacs;