const {Todo} = require("./../../models/Todo");
const {User} = require("./../../models/User");
const {ObjectID} = require("mongodb");
const jwt = require("jsonwebtoken");

const userOneId = new ObjectID();
const userTwoId = new ObjectID();

var users = [{
  _id : userOneId,
  email: "vivek@example.com",
  password: "and123",
  tokens: [{
    access: "auth",
    token : jwt.sign({_id: userOneId.toHexString() , access: "auth"}, "123abc").toString()
  }]
},{
  _id :userTwoId,
  email : "ben@example.com",
  password : "123qwe",
  tokens: [{
    access: "auth",
    token : jwt.sign({_id: userTwoId.toHexString() , access: "auth"}, "123abc").toString()
  }]
}];

var todos = [
   {
     _id: new ObjectID(),
     text:"mock data",
     _creator: userOneId
   },{
     _id: new ObjectID(),
     text:"mock data 1",
     completed: true,
     completedAt: 1234,
     _creator: userTwoId
   }
]

const populateTodos = function(done){
  this.timeout(5000);                   //even with "done" the limit is 2s therefore
  Todo.remove({}).then(()=>{            //increase the waiting time forcefully
      return Todo.insertMany(todos);    //
  }).then(()=>done());
};

const populateUsers = function(done){
  this.timeout(5000);
  User.remove({}).then(() =>{
    var UserOne = new User(users[0]).save();
    var UserTwo = new User(users[1]).save();

    return Promise.all([UserOne , UserTwo]);
  }).then(() => done());
};

module.exports = {populateTodos,populateUsers,users,todos};
