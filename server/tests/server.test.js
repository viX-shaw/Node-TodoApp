const expect = require("expect");
const request = require("supertest");
const {ObjectID} = require("mongodb");

var {Todo} = require("./../models/Todo");
var {app} = require("./../server");

var todos = [
   {
     _id: new ObjectID(),
     text:"mock data"
   },{
     _id: new ObjectID(),
     text:"mock data 1",
     completed: true,
     completedAt: 1234
   }
]

beforeEach(function(done){
  this.timeout(5000);                   //even with "done" the limit is 2s therefore
  Todo.remove({}).then(()=>{            //increase the waiting time forcefully
      return Todo.insertMany(todos);    //
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
});

describe("GET /todos/:id",()=>{
  it("should return a todo doc",(done)=>{
    request(app)
    .get(`/todos/${todos[0]._id.toHexString()}`)
    .expect(200)
    .expect((res)=>{
      expect(res.body.text).toBe(todos[0].text)
    })
    .end(done);
  });

  it("should return a 404 if todo not found",(done)=>{
    request(app)
    .get(`/todos/${new ObjectID().toHexString()}`)
    .expect(404)
    .end(done);
  });

  it("should return a 404 if non-object id is found",(done)=>{
    request(app)
    .get(`/todos/123`)
    .expect(404)
    .end(done);
  });
});

describe("DELETE /todos/:id",()=>{
  it("should delete a todo by id",(done)=>{
    var hexId = todos[0]._id.toHexString();
     request(app)
      .delete(`/todos/${hexId}`)
      .expect(200)
      .expect((res)=>{
        expect(res.body.todo._id).toBe(hexId)
      })
      .end((err,res)=>{
        if(err){
          return done(err);
        }

        Todo.findById(hexId).then((todo)=>{
          //console.log(todo);
          expect(todo).toBe(null);
          done();
        }).catch((e)=>done(e));
      });
  });

  it("should return a 404 if todo not found",(done)=>{
    request(app)
    .delete(`/todos/${new ObjectID().toHexString()}`)
    .expect(404)
    .end(done);
  });

  it("should return a 404 if invalid ids ",(done)=>{
    request(app)
    .delete(`/todos/123`)
    .expect(404)
    .end(done);
  });
});

describe("PATCH /todos/:id",()=>{
  it("should update a todo",(done)=>{
    request(app)
     .patch(`/todos/${todos[0]._id.toHexString()}`)
     .send({
       text:"mock data 2",
       completed:true
     })
     .expect(200)
     .expect((res)=>{
       
       expect(res.body.todo.text).toBe("mock data 2");
       expect(res.body.todo.completed).toBe(true);
       expect(res.body.todo.completedAt).toBeDefined();
     })
     .end(done);
  },(err)=>{
    done(err);
  });

  it("should clear completedAt when todo's completed set to false",(done)=>{
    request(app)
     .patch(`/todos/${todos[1]._id.toHexString()}`)
     .send({
       completed: false
     })
     .expect(200)
     .expect((res)=>{
       expect(res.body.todo.completed).toBe(false);
       expect(res.body.todo.completedAt).toBe(null);
     })
     .end(done)
  },(err)=>{
    done(err);
  });
});
