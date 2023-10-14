const jwt = require("express-jwt");
const { decode }  = require('jsonwebtoken');
const config = require("../config/jwt.config.js");
const jwksRsa = require("jwks-rsa");

validateToken = jwt({
    secret: jwksRsa.expressJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: config.jwksUri
    }),
    audience: config.audience,
    issuer: config.issuer,
    algorithms: ["RS256"]
});

decodeToken = (req, res, next) => {
  const auth = req.get('Authorization');
  const { sub } = decode(auth.split(' ')[1]);
  req.userId = sub;
  return next();
};


module.exports = {
  validateToken,
  decodeToken
}