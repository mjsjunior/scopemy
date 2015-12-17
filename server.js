//Configuração do servidor
var port     = process.env.PORT || 3000;
var express  = require('express');
var app      = express();                               // cria o aplicativo express
var mongoose = require('mongoose');                     // mongoose for mongodb
var config = require('./config/config'); //Carrega as configurações de banco de dados
var morgan = require('morgan');             // log requests to the console (express4)
var bodyParser = require('body-parser');    // pull information from HTML POST (express4)
var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)
var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var cookieParser = require('cookie-parser') // get cookie
var http = require('http').Server(app);
var io = require('socket.io').listen(app.listen(port));

app.use(cookieParser())

//Conecta com banco
mongoose.connect(config.database);
var conn = mongoose.connection;             
conn.on('error', console.error.bind(console, 'connection error:'));  

conn.once('open', function() {
  console.log('Banco conectado!')
  scopeMy();                       
});

function scopeMy(){
    app.set('superSecret', config.secret); // secret variable
    app.use('/static', express.static('public'));                // Define o local da conteudo estatico
    app.use('/', express.static('public'));

    app.use(morgan('dev'));                                         // log every request to the console
    app.use(bodyParser.urlencoded({ extended: false }));            // parse application/x-www-form-urlencoded
    app.use(bodyParser.json());                                     // parse application/json
    app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
    app.use(methodOverride());
    app.use(morgan('dev'));

    // Obtém as configurações de rota  do aplicativo que é passado por parametro
    //======================================================================
    require('./app/routes')(app);

    //Socket de comunicação chat
    //===============================================================================
    // usernames which are currently connected to the chat
    io.sockets.on('connection', function (socket) {

        socket.on('adduser', function(user,room){
            socket.emit('switchRoom');
            console.log('Adicionando: '+user+' na sala'+room.title)
            // store the username in the socket session for this client
            socket.username = user;
            // store the room name in the socket session for this client
            socket.room = room._id;
            // send client to room 1
            socket.join(room._id);
            // echo to client they've connected
            socket.emit('updatechat', 'SERVER', 'Você acessou a sala: '+room.title);
            // echo to room 1 that a person has connected to their room
            socket.broadcast.to(socket.room).emit('updatechat', 'SERVER', socket.username+' acabou de entrar...');
        });

        // when the client emits 'sendchat', this listens and executes
        socket.on('sendchat', function (user,data) {
            // we tell the client to execute 'updatechat' with 2 parameters
            io.sockets.in(socket.room).emit('updatechat',user, data);
        });

        socket.on('switchRoom', function(){
            // sent message to OLD room
            socket.broadcast.to(socket.room).emit('updatechat', 'SERVER', socket.username+' has left this room');
            // update socket session room title
            socket.leave(socket.room);
        });


        // when the user disconnects.. perform this
        socket.on('disconnect', function(){
                // remove the username from global usernames list
 
                // echo globally that this client has left
                    socket.broadcast.to(socket.room).emit('updatechat', 'SERVER', socket.username+' deixou a sala...:');
        socket.leave(socket.room);
            });
    });
    // listen (start app with node server.js) 
    //========================================================
    // app.listen(port);
    console.log("App listening on port "+port);
}

//******
//FONTE socket
//https://github.com/mmukhin/psitsmike_example_2/blob/master/app.js