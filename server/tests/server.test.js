const expect = require("expect");
const request = require("supertest");
const {ObjectID} = require("mongodb");

var {Todo} = require("./../models/Todo");
var {User} = require("./../models/User");
var {app} = require("./../server");
var {populateTodos,todos,populateUsers,users} = require("./seed/seed")

beforeEach(populateUsers);
beforeEach(populateTodos);

describe("POST Todo",()=>{

   it("should create a new todo",(done)=>{
      var text = "simple todo test";
      request(app)                       //Sending post reequest to server.js
        .post("/todos")               //with a mock json value
        .set("x-auth", users[0].tokens[0].token)
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
       .set("x-auth", users[0].tokens[0].token)
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
      .set("x-auth", users[0].tokens[0].token)
      .expect(200)
      .expect((res)=>{
        expect(res.body.todos.length).toBe(1);
      })
      .end(done);
  });
});

describe("GET /todos/:id",()=>{
  it("should return a todo doc",(done)=>{
    request(app)
    .get(`/todos/${todos[0]._id.toHexString()}`)
    .set("x-auth", users[0].tokens[0].token)
    .expect(200)
    .expect((res)=>{
      expect(res.body.text).toBe(todos[0].text)
    })
    .end(done);
  });

  it("should not return a todo doc created by other user",(done)=>{
    request(app)
    .get(`/todos/${todos[1]._id.toHexString()}`)
    .set("x-auth", users[0].tokens[0].token)
    .expect(404)
    .end(done);
  });

  it("should return a 404 if todo not found",(done)=>{
    request(app)
    .get(`/todos/${new ObjectID().toHexString()}`)
    .set("x-auth", users[0].tokens[0].token)
    .expect(404)
    .end(done);
  });

  it("should return a 404 if non-object id is found",(done)=>{
    request(app)
    .get(`/todos/123`)
    .set("x-auth", users[0].tokens[0].token)
    .expect(404)
    .end(done);
  });
});

describe("DELETE /todos/:id",()=>{
  it("should delete a todo by id",(done)=>{
    var hexId = todos[0]._id.toHexString();
     request(app)
      .delete(`/todos/${hexId}`)
      .set("x-auth", users[0].tokens[0].token)
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

  it("should not delete a todo by id created by other users",(done)=>{
    var hexId = todos[1]._id.toHexString();
     request(app)
      .delete(`/todos/${hexId}`)
      .set("x-auth", users[0].tokens[0].token)
      .expect(404)
      .end((err,res)=>{
        if(err){
          return done(err);
        }

        Todo.findById(hexId).then((todo)=>{
          //console.log(todo);
          expect(todo).not.toBe(null);
          done();
        }).catch((e)=>done(e));
      });
  });

  it("should return a 404 if todo not found",(done)=>{
    request(app)
    .delete(`/todos/${new ObjectID().toHexString()}`)
    .set("x-auth", users[0].tokens[0].token)
    .expect(404)
    .end(done);
  });

  it("should return a 404 if invalid ids ",(done)=>{
    request(app)
    .delete(`/todos/123`)
    .set("x-auth", users[0].tokens[0].token)
    .expect(404)
    .end(done);
  });
});

describe("PATCH /todos/:id",()=>{
  it("should update a todo",(done)=>{
    request(app)
     .patch(`/todos/${todos[0]._id.toHexString()}`)
     .set("x-auth", users[0].tokens[0].token)
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

  it("should not update a todo created by other users",(done)=>{
    request(app)
     .patch(`/todos/${todos[0]._id.toHexString()}`)
     .set("x-auth", users[1].tokens[0].token)
     .send({
       text:"mock data 2",
       completed:true
     })
     .expect(404)
     .end(done);
  },(err)=>{
    done(err);
  });

  it("should clear completedAt when todo's completed set to false",(done)=>{
    request(app)
     .patch(`/todos/${todos[1]._id.toHexString()}`)
     .set("x-auth", users[1].tokens[0].token)
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

describe("GET /users/me", ()=>{
  it("should return user if authenticated", (done) =>{
    request(app)
      .get("/users/me")
      .set("x-auth",users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body._id).toBe(users[0]._id.toHexString());
        expect(res.body.email).toBe(users[0].email);
      })
      .end(done);
  });

  it("should return 401 if not authorized", (done)=>{
    request(app)
      .get("/users/me")
      .expect(401)
      .expect((res) => {
        expect(res.body).toEqual({});
      })
      .end(done);
  })
});

describe("POST /users", () => {
  it("should create a user", (done)=>{
    var email = "piyush@example.com";
    var password = "1234acd"
    request(app)
     .post("/users")
     .send({email, password})
     .expect(200)
     .expect((res)=>{
       expect(res.headers['x-auth']).toBeDefined();
       expect(res.body._id).toBeDefined();
       expect(res.body.email).toBeDefined();
     })
     .end((err) => {
       if(err){
       return done(err);
     }

     User.findOne({email}).then((user) =>{
       expect(user).toBeDefined();
       expect(user.password).not.toBe(password);
       done();
     }).catch((e)=>done(e));
   });
  });

  it("should return validation errors if request is invalid",(done)=>{
    request(app)
     .post("/users")
     .send({
       email : "viu.com",
       password : "123"
     })
     .expect(400)
     .end(done);
  });

  it("should not create a user if email is in use",(done) => {
    request(app)
     .post("/users")
     .send({
       email :users[0].email,
       password: users[0].password
     })
     .expect(400)
     .end(done)
  });
})

describe("POST /users/login", ()=>{
  it("should login user and return auth token",(done)=>{
    request(app)
     .post("/users/login")
     .send({
       email: users[1].email,
       password: users[1].password
     })
     .expect(200)
     .expect((res)=>{
       expect(res.headers["x-auth"]).toBeDefined();
     })
     .end((err, res)=>{
       if(err){
         return done(err)
       }

       User.findById(users[1]._id).then((user)=>{
         expect(user.tokens[1]).toHaveProperty("access", "auth");
         expect(user.tokens[1]).toHaveProperty("token", res.headers["x-auth"]);
         done();
       }).catch((e) => done(e));
     });
  });

  it("should reject an invalid login",(done)=>{
    request(app)
     .post("/users/login")
     .send({
       email: users[1].email,
       password: users[1].password + "1"
     })
     .expect(400)
     .expect((res)=>{
       expect(res.headers["x-auth"]).not.toBeDefined();
     })
     .end((err, res)=>{
       if(err){
         return done(err);
       }

       User.findById(users[1]._id).then((user) =>{
         expect(user.tokens.length).toBe(1);
         done();
       }).catch((e)=>done(e));
     });
  });
});

describe("DELETE /users/me/token",()=>{
  it("should remove auth token on logout", (done)=>{
    request(app)
      .delete("/users/me/token")
      .set("x-auth",users[0].tokens[0].token)
      .expect(200)
      .expect((res)=>{
        expect(res.headers["x-auth"]).not.toBeDefined();
      })
      .end((err, res)=>{
        if(err){
          return done(err);
        }

        User.findById(users[0]._id).then((user)=>{
          expect(user.tokens.length).toBe(0);
          done();
        }).catch((e)=>done(e));
      });
  });
});
