const io = require("socket.io")();
const userModel = require('./routes/users')
const msgModel = require("./routes/msg")
const socketapi = {
    io: io
};

// Add your socket.io logic here!
io.on("connection", function (socket) {

    console.log("A user connected");
    // const usersOnline = [];
    socket.on('userConnected', async msg => {
        var connectedUser = await userModel.findOne({
            username: msg.username
        })
        connectedUser.currentSocket = socket.id
        await connectedUser.save()
    })

    socket.on("disconnect", async () => {
        await userModel.findOneAndUpdate({
            currentSocket: socket.id
        }, {
            currentSocket: ""
        })
    })

    socket.on('newmsg', async msg => {

        var toUser = await userModel.findOne({
            username: msg.toUser
        })
        var fromUser = await userModel.findOne({
            username: msg.fromUser
        })

        var indexOfFromUser = toUser.chats.indexOf(fromUser._id)      // if fromUser exist in toUser chats, then he already talks
        if (indexOfFromUser == -1) {                                  //initialize new chat coming
            toUser.chats.push(fromUser._id)
            fromUser.chats.push(toUser._id)
            await toUser.save()
            await fromUser.save()
            msg.isNewChat = true
        }
        msg.fromUserPic = fromUser.pic

        var newMsg = await msgModel.create({           // msgModel
            data: msg.msg,
            toUser: toUser.username,
            fromUser: fromUser.username
        })
        console.log(newMsg)

        if (toUser.currentSocket)
            socket.to(toUser.currentSocket).emit('msg', msg)      // jis user se msg aya use msg kro
    })

})
// end of socket.io logic

module.exports = socketapi;