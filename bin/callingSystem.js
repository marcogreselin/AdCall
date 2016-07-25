/**
 * Created by marco on 25/07/2016.
 */
module.exports = function(server) {
    var io = require('socket.io')(server);

    io.on("connection", handleIO);


    // This is the connection handler
    function handleIO(socket) {
        // function disconnectIO(){
        //   console.log("disconnect on server");
        // }


        // console.log("client connected on server");
        // socket.on("disconnect", disconnectIO);

        socket.on("typeit", function (nm) {
            console.log(nm);
            socket.broadcast.emit("newmessage", nm);
        })
    }
};