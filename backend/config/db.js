const mongoose = require("mongoose");
mongoose.connect(process.env.MONGOURL || "mongodb://127.0.0.1:27017/Blinkkart").then(function (){
    console.log("database connected");
    

});


module.exports= mongoose.connection;

