var sys = require('sys');

function Unitacs(){
    sys.puts('Unitacs');
    
    this.takenNames = [];
};

Unitacs.prototype.handleData = function(data, client) {
    sys.puts(data);
    sys.puts(sys.inspect(client));
};

module.exports = Unitacs;