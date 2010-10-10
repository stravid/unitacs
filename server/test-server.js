var http = require('http'), 
    url = require('url'),
    fs = require('fs'),
    sys = require('sys'),
    //io = require('../socket.io-server/lib/socket.io'),
    Unitacs = require('./lib/unitacs');
    
    
var unitacsServer = new Unitacs(),
    DummyClient = function() {
    };

DummyClient.prototype.send = function(message) {
   sys.puts(sys.inspect(message)); 
};


unitacsServer.handleData({name: 'stravid'}, new DummyClient());
unitacsServer.handleData({name: 'ebsi'}, new DummyClient());