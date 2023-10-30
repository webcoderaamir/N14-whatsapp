const mongoose = require("mongoose");
const plm = require("passport-local-mongoose")

const userSchema = mongoose.Schema({
  username : String,
  pic : String,
  chats : [
    {
      type : mongoose.Schema.Types.ObjectId,
      ref : "users"
    }
  ],
  currentSocket : String,
})

userSchema.plugin(plm)

module.exports = mongoose.model("user", userSchema)