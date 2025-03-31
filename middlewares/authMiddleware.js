const { validateToken } = require('../services/authService');

function checkForAuthenticationCookie(cookieName) {
  return (req, res, next) => {
    const tokenCookieValue = req.cookies[cookieName];
    if (!tokenCookieValue) {
      return next();
    }

    try {
      const userPayload = validateToken(tokenCookieValue);
      req.user = userPayload;
    } catch (error) {
      res.clearCookie(cookieName);
    }

    return next();
  };
}

module.exports = {
  checkForAuthenticationCookie,
};
