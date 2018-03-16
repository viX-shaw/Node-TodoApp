const {MongoClient, ObjectID} = require("mongodb");

MongoClient.connect("mongodb://localhost:27017", (err, client) => {
  if(err)
  {
    console.log("Unable to connect to mongodb database");
    return;
  }
  console.log("Connected to mongodb database");
   var db = client.db("TodoApp");

   db.collection('Todos').find(
     {
       _id: new ObjectID("5aabde898e869812e8e803a6")
       // completed:false
     }).toArray().then((docs) =>{
    console.log("Todos");
    console.log(JSON.stringify(docs,undefined,2));
  },
    (err) =>{
        console.log("Unable to fetch Todos");

    });

  client.close();
});
