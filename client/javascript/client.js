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

document.getElementById('nameForm').onclick = function() {
    socket.send({name: document.getElementById('playerName').value});  
};