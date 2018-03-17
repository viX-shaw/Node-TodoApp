const {MongoClient, ObjectID} = require("mongodb");

MongoClient.connect("mongodb://localhost:27017/TodoApp", (err, client) => {
  if(err)
  {
    console.log("Unable to connect to mongodb database");
    return;
  }
  console.log("Connected to mongodb database");
   var db = client.db("TodoApp");
  // db.collection('Todos').insertOne({
  //   text:"something to do",
  //   completed:false
  // },(err, result) =>{
  //   if(err){
  //     console.log("Unable to insert todo into database");
  //     return;
  //   }
  //
  //   console.log(JSON.stringify(result.ops,undefined,2));
  // });

  db.collection("Users").insertOne({             // insert
    _id:123,
    name:"Chang",
    age:21,
    location:"China"
  },(err, result)=>{
       if(err)
       {
         return console.log("Unable to insert todo",err);
       }
       console.log(result.ops);
  });

  client.close();
});
