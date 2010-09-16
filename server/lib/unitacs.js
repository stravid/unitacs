module.exports = function Unitacs(){
    sys.puts('Unitacs');
    
    this.takenNames = [];
};

Unitacs.prototype.handleData = function(data, client) {
    sys.puts(data);
    sys.puts(sys.inspect(client));
};