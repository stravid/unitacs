var sys = require('sys');

function Unitacs(){
    sys.puts('Unitacs');
    
    this.takenNames = [];
};

Unitacs.prototype.handleData = function(data, client) {
    sys.puts(data);
    
    client.send(data);
};

module.exports = Unitacs;