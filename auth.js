const jwtSecret = 'my_secret_key'; //This has to be the same key used in the JWT Strategy (in passports.js)

const jwt = require('jsonwebtoken'),
  passport = require('passport');

require('./passport'); //Your local pssport file, checks is the user and pass exists then is creates a JWT below if it does

/**
 * Generate a JWT Token
 * @param {object} user
 * @returns {string}
 */
let generateJWTToken = (user) => {
  return jwt.sign(user, jwtSecret, {
    subject: user.username,
    expiresIn: '1d',
    algorithm: 'HS256',
  });
};

module.exports = (router) => {
  /** User login
   * @name post/login
   * @function
   * @memberof module:routers/app~appRouter
   * @inner
   * @param {object} User
   * @returns {object} an object containing the username and password
   * */
  router.post('/login', (req, res) => {
    passport.authenticate('local', { session: false }, (error, user, info) => {
      console.log({ error, user });
      if (error || !user) {
        return res.status(400).json({
          message: 'Something is not right',
          user: user,
          error,
        });
      }
      req.login(user, { session: false }, (error) => {
        if (error) {
          res.send(error);
        }
        let token = generateJWTToken(user.toJSON());
        return res.json({ user, token });
      });
    })(req, res);
  });
};
