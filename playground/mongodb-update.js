const {MongoClient, ObjectID} = require("mongodb");

MongoClient.connect("mongodb://localhost:27017/TodoApp", (err, client) => {
  if(err)
  {
    console.log("Unable to connect to mongodb database");
    return;
  }
  console.log("Connected to mongodb database");
   var db = client.db("TodoApp");

   db.collection("Users").findOneAndUpdate(

     {
        _id: new ObjectID("5aad235df0b62d34ccbdc1c1")
     },
     {
       $set: {
         name:"Chang"
       },
       $inc: {
         age: 1
       }
     },
     {
       returnOriginal:false
     }).then((result) =>{
       console.log(result);
     });

     client.close();
});
