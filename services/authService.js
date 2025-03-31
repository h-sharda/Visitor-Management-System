const JWT = require('jsonwebtoken');
const secret = process.env.JWT_SECRET_KEY;

function createTokenForUser(user) {
  const payload = {
    _id: user._id,
    email: user.email,
    name: user.fullName,
    role: user.role
  };
  const token = JWT.sign(payload, secret, { 
    expiresIn: '90d',
    algorithm: 'HS256'
   });
  return token;
}

function validateToken(token) {
  try {
    const payload = JWT.verify(token, secret);
    return payload;
  } catch (error) {
    throw new Error('Invalid token');
  }
}

module.exports = {
  createTokenForUser,
  validateToken,
};
