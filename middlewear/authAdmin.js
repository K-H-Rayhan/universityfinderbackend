const e = require("express");
var jwt = require("jsonwebtoken");

function authAdmin(req, res, next) {
  const token = req.header("x-auth-token");

  try {
    if (!token) {
      res.status(401).json({ msg: "no token, auht denied" });
    } else {
      const decoded = jwt.verify(token, "i still dont knwo");
      req.user = decoded;
      console.log(req.user.role);
      if (req.user.role == "admin") {
        next();
      } else {
        res.status(400).json({ msg: "No Permission" });
      }
    }
  } catch (e) {
    res.status(400).json({ msg: "Token not valid" });
  }
}
module.exports = authAdmin;
