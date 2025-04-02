import JWT from 'jsonwebtoken';

const secret = process.env.JWT_SECRET_KEY;

export function createTokenForUser(user) {
  const payload = {
    _id: user._id,
    email: user.email,
    name: user.fullName,
    role: user.role
  };
  return JWT.sign(payload, secret, { 
    expiresIn: '90d',
    algorithm: 'HS256'
  });
}

export function validateToken(token) {
  try {
    return JWT.verify(token, secret);
  } catch (error) {
    throw new Error('Invalid token');
  }
}
