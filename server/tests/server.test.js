const expect = require("expect");
const request = require("supertest");

var {Todo} = require("./../models/Todo");
var {app} = require("./../server");

var todos = [
   {
     text:"mock data"
   },{
     text:"mock data 1"
   }
]

beforeEach(function(done){
  this.timeout(5000);                   //even with done the linit is 2s therefore
  Todo.remove({}).then(()=>{            //increase the waiting time forcefully
      return Todo.insertMany(todos);
  }).then(()=>done());
});
describe("POST Todo",()=>{

   it("should create a new todo",(done)=>{
      var text = "simple todo test";
      request(app)                       //Sending post reequest to server.js
        .post("/todos")                  //with a mock json value
        .send({text})                    //expecting the status code and
        .expect(200)
        .expect((res)=>{                 //a respone which can be
          expect(res.body.text).toBe(text);//expected to hold the original mock string
        })
        .end((err, res) =>{            //and ending the request with an
          if(err){                     //error handling for the above code
            return done(err);             // and be "done" with it
          }

          Todo.find({text}).then((docs)=>{      //Also checking the collection
            expect(docs.length).toBe(1);   //only contains 1 entry
            expect(docs[0].text).toBe(text);//and that is equal to the mock value
            done();
          }).catch((e)=>done(e));  //the above test will pass even if the expect fails
        });                        //without error handling so "catch".
   });

   it("should not create a new todo with a bad request",(done)=>{
     request(app)
       .post("/todos")
       .send({})             //a new instance without the text property gets
       .expect(400)             //created when used .send({}) therfore create
       .end((err,res)=>{        //a new var and set it to null
         if(err){
           return done(err);
         }

         Todo.find({}).then((todos)=>{
           expect(todos.length).toBe(2);
           done();
         }).catch((e)=>done(e));
       });
   });
});

describe("GET /todos",()=>{
  it("should get all todos ",(done)=>{
    request(app)
      .get("/todos")
      .expect(200)
      .expect((res)=>{
        expect(res.body.todos.length).toBe(2);
      })
      .end(done);
  });
});///
