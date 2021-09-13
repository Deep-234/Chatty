const mongoose = require('mongoose')

const Wp = mongoose.Schema({
    message:String,
    timestamp:String,
    name:String,
    recieved:Boolean
})
module.exports= mongoose.model('wpmsgs',Wp); 