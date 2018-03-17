const {MongoClient, ObjectID} = require("mongodb");

MongoClient.connect("mongodb://localhost:27017", (err, client) => {
  if(err)
  {
    console.log("Unable to connect to mongodb database");
    return;
  }
  console.log("Connected to mongodb database");
   var db = client.db("TodoApp");

   db.collection('Users').findOneAndDelete(
     {
       age:21
       // completed:false
     }).then((result) =>{
    //console.log("Todos");
    console.log(result);
  },
    (err) =>{
        console.log("Unable to fetch Todos");

    });

  client.close();
});
