const express = require('express')
const mongoose = require('mongoose');
const Messages = require('./db/dbmsg')
const app = express();
const {mongo2,mogouri} = require('./config/keys')
const cors = require('cors')
const Pusher = require('pusher')
const port = process.env.port || 9000

//pusher
const pusher = new Pusher({
    appId: "1253484",
    key: "e3b135583f868e2356d1",
    secret: "325d5ba6d6815e1b8002",
    cluster: "ap2",
    useTLS: true
  });

  //middleware
app.use(express.json())
app.use(cors());
// app.use((req,res)=>{// we are using cors
//     res.setHeader("Access-Control-Allow-Origin","*")
//     res.setHeader("Access-Control-Allow-Header","*")
//     next();
// })

mongoose.connect(mogouri,{
    useCreateIndex:true,
    useNewUrlparser : true,
    useUnifiedTopology : true
})

//watch db for a change
const db = mongoose.connection;
db.once("open",()=>{
    console.log("db connected")
    const msgwatched = db.collection("wpmsgs");
    const streamchange = msgwatched.watch();
    streamchange.on("change",(change)=>{
        console.log("Something changed:",change);
        if (change.operationType === "insert") {
            const messageDetails = change.fullDocument;
            pusher.trigger("messages","inserted",{
                name: messageDetails.name,
                message: messageDetails.message,
                timestamp: messageDetails.timestamp,
                received : messageDetails.received
            });
        } else {
            console.log("Error triggering Pusher");
        }
    })
})

//connection
mongoose.connection.on('connected',()=>{
    console.log("connected");
})
mongoose.connection.on('error',(err)=>{
    console.log("error",err)
})





//syncin msgs
app.get('/messages/sync',(req,res)=>{
Messages.find((err,data)=>{
    if(err){
        res.status(400).send(err);
    }else{
        res.status(200).send(data);
       // console.log(data);
        //console.log(data)
    }
})
})

//adding msgs to db
app.post('/messages/new', (req,res)=>{
    const dbmsg = req.body
    Messages.create(dbmsg,(err,data)=>{
        if(err){
            console.log("error",err)
        }else{
            
            res.send(data);
        }
    })

})

app.listen(port,()=>{
    console.log("server running on",port);
})