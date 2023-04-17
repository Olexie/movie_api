const { default: mongoose } = require("mongoose");

let movies_schema = mongoose.Schema({
  title: { type: String, required: true },
  releaseUs: { type: String, required: true },
  universe: {
    name: String,
    description: String,
  },
  director: {
    name: String,
    bio: String,
    birth: Date,
  },
});

let users_schema = mongoose.Schema({
  name: { type: String },
  username: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
  birthday: Date,
  favouriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Movie" }],
});

users_schema.methods.validatePassword = function (password) {
  return password == this.password;
};

// create models
let Movie = mongoose.model("Movie", movies_schema);
let User = mongoose.model("User", users_schema);

module.exports.Movie = Movie;
module.exports.User = User;
