/**
 * Created by marco on 25/07/2016.
 */
module.exports = function(server, app) {
    var io = require('socket.io')(server),
        passportSocketIo = require('passport.socketio'),
        sessionStore = app.sessionStore,
        cookieParser = require('cookie-parser'),
        queries = require('../src/db/queries');


    io.use(passportSocketIo.authorize({
        key: 'connect.sid',
        secret: 'buttery',
        store: sessionStore,
        cookieParser: cookieParser,
        success:      onAuthorizeSuccess,
        fail:         onAuthorizeFail
    }));
    // // console.log(sessionStore)
    // function onAuthorizeSuccess(){
    //     console.log('yeah')
    //     accept();
    // }
    // function onAuthorizeFail() {
    //     console.log('no')
    // }
    
    function onAuthorizeSuccess(data, accept) {
        console.log('An agent connected'+JSON.stringify(data));
        accept();
    }
    
    function onAuthorizeFail(data, message, error, accept) {
        console.log('A banner connected')
        accept(null, !error);
    }

    io.on('connection', function(socket){
        console.log('a user connected');

        socket.on("incomingCall", function () {
            console.log("hello")
        });

        socket.on("logon", function () {
            console.log(socket.request.user.companyid)
            socket.join(socket.request.user.companyid);
            // console.log(io.nsps['/'].adapter.rooms[socket.request.user.companyid])


            var currentRoom = io.nsps['/'].adapter.rooms[socket.request.user.companyid];
            var currentUsersInRoom = currentRoom.sockets;
            console.dir(currentUsersInRoom);



            // console.log('Agent logged on: '+socket.request.user.agentid);
            // console.log('Current namespaces: '+Object.keys(io.nsps));
            // if(Object.keys(io.nsps).includes(socket.request.user.agentid)){
            //     console.log('exist');
            // } else {
            //     console.log('does not exist')
            // }
        })
    });


};