var http = require('http'), 
        url = require('url'),
        fs = require('fs'),
        sys = require('sys'),
        io = require('../socket.io-server/lib/socket.io'),
        
        writeFile = function (path, res) {
            path = '..' + path;
            
            var extention = path.substr(path.lastIndexOf('.')),
                contentType;
            
            switch (extention) {
                case '.js':
                    contentType = 'text/javascript';
                    break;
                case '.html':
                    contentType = 'text/html';
                    break;
                case '.swf':
                    contentType = 'application/x-shockwave-flash';
                    break;
            }
            
            fs.readFile(path, function(err, data){
                 if (err) return send404(res);
                 res.writeHead(200, {'Content-Type': contentType})
                 res.write(data, 'utf8');
                 res.end();
             });
        },
        
server = http.createServer(function(req, res){
    
    // your normal server code
    var path = url.parse(req.url).pathname;
    writeFile(path, res);
}),

send404 = function(res){
    res.writeHead(404);
    res.write('404');
    res.end();
};

server.listen(8080);
        
// socket.io, I choose you
// simplest chat application evar
var io = io.listen(server),
        buffer = [];
        
io.on('connection', function(client){
    client.send({ buffer: buffer });
    client.broadcast({ announcement: client.sessionId + ' connected' });

    client.on('message', function(message){
        var msg = { message: [client.sessionId, message] };
        buffer.push(msg);
        if (buffer.length > 15) buffer.shift();
        client.broadcast(msg);
    });

    client.on('disconnect', function(){
        client.broadcast({ announcement: client.sessionId + ' disconnected' });
    });
});