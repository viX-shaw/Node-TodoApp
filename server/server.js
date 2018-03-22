var express = require("express");
var bodyParser=require("body-parser");
var {ObjectID} = require("mongodb");

var {mongoose} = require("./db/mongoose");   //it will run the connect and export statements
var {Todo} = require("./models/Todo");
var {User} = require("./models/User");

var app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post("/todos",(req,res)=>{       //hhtp post method to colloect user input
 if(req.body.text === undefined){
   req.body.text = "";
 }
  var todo =new Todo({                //creatin a new instance from mongoose model //:
    text:req.body.text
  });

  todo.save().then((doc)=>{
    res.send(doc);
  },err=>{
    res.status(400).send(err);
  });
});

app.get("/todos",(req,res)=>{
  Todo.find({}).then((todos)=>{
     res.send({todos});
  },(err)=>{
    res.status(400).send(err);
  });
});

app.get("/todos/:id",(req,res)=>{   //requesting a particular entry in the DB
  var id = req.params.id;
  if(!ObjectID.isValid(id)){
   return res.status(404).send();
  //  return res.status(404).send("Invalid id");         //Checking the validity of id var
  }
  Todo.findById(id).then((todo)=>{
    if(todo === null)
    {
      return res.status(404).send()
      // return res.status(404).send("No matching todo")
    }
    res.send(todo);
  },(err)=>{
    console.log(err);
    res.status(400).send();
  });
});

app.delete("/todos/:id",(req,res)=>{
  var id = req.params.id;
  if(!ObjectID.isValid(id)){
    return res.status(404).send();
  }

  Todo.findByIdAndRemove(id).then((todo)=>{
    if(todo === null)
    {
      return res.status(404).send();
    }
    res.send({todo});
  }).catch((e)=>{
    console.log(e);
    res.status(400).send();
  });
});

app.listen(port,()=>{
  console.log(`Server started on port ${port}`);
});

module.exports = {app};
