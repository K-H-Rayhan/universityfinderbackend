var jwt = require("jsonwebtoken");

function auth(req, res, next) {
  const token = req.header("x-auth-token");
  try {1
    if (!token) {
      res.status(401).json({ msg: "no token, auht denied" });
    } else {
      const decoded = jwt.verify(token, "i still dont knwo");
      req.user = decoded;
      console.log(decoded);
      next();
    }
  } catch (e) {
    res.status(400).json({ msg: "Token not valid" });
  }
}
module.exports = auth;
