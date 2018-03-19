var express = require("express");
var bodyParser=require("body-parser");

var {mongoose} = require("./db/mongoose");   //it will run the connect and export statements
var {Todo} = require("./models/Todo");
var {User} = require("./models/User");

var app = express();

app.use(bodyParser.json());

app.post("/todos",(req,res)=>{       //hhtp post method to colloect user input
 if(req.body.text === undefined){
   req.body.text = "";
 }
  var todo =new Todo({                //creating a new instance from mongoose model //:
    text:req.body.text
  });

  todo.save().then((doc)=>{
    res.send(doc);
  },err=>{
    res.status(400).send(err);
  });
});

app.listen(3000,()=>{
  console.log("Server started on port 3000");
});

module.exports = {app};
