console.log('Ready to go master!');

io.setPath('../socket.io-client/');

var socket = new io.Socket(null, {port: 8080});

socket.connect();
socket.on('message', function(data) {
    if (typeof(data) == "string") {
        data = data.substr(3, data.length - 1);
        data = JSON.parse(data);
    }
    
    console.log('Master, you received praise: %o', data);
    
    if (data.isNameTaken) {
        document.getElementById('error').style.display = 'block';
    }
    
    if (data.chat) {
        document.getElementById('chat').innerHTML = document.getElementById('chat').innerHTML + '<li><strong>' + data.chat.name + '</strong>: ' + data.chat.message + '</li>';
    }
    
    if (data.map) {
        document.getElementById('nameForm').style.display = 'none';
        document.getElementById('mapContainer').style.display = 'block';
        document.getElementById('infoContainer').style.display = 'block';
    }
    
    
    /*
    if ('buffer' in data) {
        document.getElementById('form').style.display='block';
        document.getElementById('chat').innerHTML = '';
        
        for (var i in data.buffer) {
            message(data.buffer[i]);
        }
        
    } else {
        message(data);
    }*/
});

document.getElementById('play').onclick = function() {
    send({name: document.getElementById('playerName').value});  
};

document.getElementById('send').onclick = function() {
    send({message: document.getElementById('message').value});  
};

document.getElementById('nameForm').onsubmit = function() {
    send({name: document.getElementById('playerName').value});
    
    return false;
};

document.getElementById('chatForm').onsubmit = function() {
    send({message: document.getElementById('message').value});
    
    return false; 
};

function send(data) {
    if (window.WebSocket) {
        socket.send('~j~' + JSON.stringify(data));
    } else {
        socket.send(data);
    }
};