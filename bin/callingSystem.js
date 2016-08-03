/**
 * Created by marco on 25/07/2016.
 */
module.exports = function(server, app) {
    var io = require('socket.io')(server),
        passportSocketIo = require('passport.socketio'),
        sessionStore = app.sessionStore,
        cookieParser = require('cookie-parser'),
        queries = require('../src/db/queries');


    // io.use(passportSocketIo.authorize({
    //     key: 'connect.sid',
    //     secret: 'buttery',
    //     store: sessionStore,
    //     cookieParser: cookieParser,
    //     success:      onAuthorizeSuccess,
    //     fail:         onAuthorizeFail
    // }));

    function onAuthorizeSuccess(data, accept) {
        console.log('An agent connected'+JSON.stringify(data));
        accept();
    }
    
    function onAuthorizeFail(data, message, error, accept) {
        console.log('A banner connected')
        accept(null, !error);
    }


    function get_clients_by_room(roomId, namespace) {
        io.of(namespace || "/").in(roomId).clients(function (error, clients) {
            if (error) { throw error; }
            // console.log(clients[0]); // => [Anw2LatarvGVVXEIAAAD]
            // console.log(io.sockets.sockets[clients[0]]); //socket detail
            return clients;
        });
    }
    //then










    io.on('connection', function(socket){
        console.log('a user connected');

        socket.on("incomingCall", function () {
            console.log("hello")
        });

        socket.on("logon", function () {
            socket.join(51);


            console.log(io.nsps['/'].adapter.rooms['51']);
        })
    });


};