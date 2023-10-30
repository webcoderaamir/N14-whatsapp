const mongoose = require("mongoose")

const msgSchema = mongoose.Schema({
    data : String,
    fromUser : String,
    toUser : String,
})

module.exports = mongoose.model("msg", msgSchema)