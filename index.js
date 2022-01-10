var express = require("express");
var app = express();
var cors = require("cors");
var port = process.env.PORT || 3001;
var bcrypt = require("bcryptjs");
const bodyparser = require("body-parser");
var jwt = require("jsonwebtoken");
const auth = require("./middlewear/auth");
const authAdmin = require("./middlewear/authAdmin");
// Body-parser middleware
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());
app.use(cors());

var mysql = require("mysql");
var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "finduniversity",
});
con.connect(function (err) {
  if (err) console.log(err);
  console.log("Connected!");
});

//university finding api
app.get("/api/find", function (req, res) {
  con.query(
    "SELECT * FROM `university` WHERE 1 ORDER BY univeristy_qsranking ASC",
    function (err, result, fields) {
      if (err) console.log(err);
      //   console.log(result);
      res.send(result);
      console.log(req.body);
    }
  );
});
//inidividual university finding api
app.get("/api/find/*", (req, res) => {
  con.query(
    `SELECT * FROM university WHERE slug='${req.params[0]}'`,
    function (err, result, fields) {
      if (err) console.log(err);
      //   console.log(result);
      res.send(result);
    }
  );
});

//register api starts
app.post("/api/register", (req, res) => {
  try {
    const { name, email, school, phone, password } = req.body;
    var salt = bcrypt.genSaltSync(10);
    var hash = bcrypt.hashSync(password, salt);
    con.query(
      `INSERT INTO users(uid, u_name, u_email, u_school, u_phone, u_password, role) VALUES ('[value-1]','${name}','${email}','${school}','${phone}','${hash}','student')`,
      function (err, result, fields) {
        if (err) {
          res.status(200).json({ msg: "Duplicate" });
        } else {
          jwt.sign(
            { email: email, role: "student" },
            "i still dont knwo",
            (err, token) => {
              if (err) throw err;
              else {
                res.json({
                  token: token,
                  user: {
                    name: name,
                    email: email,
                    phone: phone,
                    school: school,
                    role: "student",
                  },
                });
              }
            }
          );
        }
      }
    );
  } catch (e) {
    console.log(e);
  }
});

app.post("/api/login", (req, res) => {
  try {
    const { email, password } = req.body;
    con.query(
      `SELECT * FROM users WHERE u_email='${email}'`,
      function (err, result) {
        if (err) {
          console.log(err);
        } else {
          if (result[0] == undefined) {
            res.status(200).json({ msg: "Wrong" });
          } else {
            if (bcrypt.compareSync(password, result[0].u_password)) {
              jwt.sign(
                { email: email, role: result[0].role },
                "i still dont knwo",
                (err, token) => {
                  if (err) throw err;
                  else {
                    res.json({
                      token: token,
                      user: {
                        name: result[0].u_name,
                        email: result[0].u_email,
                        phone: result[0].u_phone,
                        school: result[0].u_school,
                        role: result[0].role,
                      },
                    });
                  }
                }
              );
            } else {
              res.status(200).json({ msg: "Wrong" });
            }
          }
        }
      }
    );
  } catch (e) {
    console.log(e);
  }
});

//register api ends

//university filter api
app.get("/api/filter", function (req, res) {
  const { sscgpa, hscgpa, location, department } = req.query;
  console.log(sscgpa, hscgpa, location, department);
  if (location == "Bangladesh") {
    con.query(
      `SELECT *
      FROM university, university_department, departments
      where university.univeristy_id = university_department.univeristy_id AND departments.department_name='${department}' AND university.university_ssc<=${sscgpa} AND university.university_hsc<=${hscgpa} AND university.university_total<=${
        parseInt(sscgpa) + parseInt(hscgpa)
      }`,
      function (err, result, fields) {
        if (err) console.log(err);
        //   console.log(result);
        res.send(result);
      }
    );
  } else {
    console.log(parseInt(sscgpa) + parseInt(hscgpa));
    con.query(
      `SELECT *
      FROM university, university_department, departments
      where university.univeristy_id = university_department.univeristy_id AND departments.department_name='${department}' AND university.university_ssc<=${sscgpa} AND university.university_hsc<=${hscgpa} AND university.university_total<=${
        parseInt(sscgpa) + parseInt(hscgpa)
      } AND university.university_location='${location}'`,
      function (err, result, fields) {
        if (err) console.log(err);
        //   console.log(result);
        res.send(result);
      }
    );
  }
});

//wishlist
app.post("/api/wishlist", function (req, res) {
  const { univeristy_id, user_mail } = req.query;
  console.log(univeristy_id + "mail: " + user_mail);
  con.query(
    `SELECT wishlist_id, u_email, univeristy_id FROM wishlist WHERE u_email='${user_mail}' AND univeristy_id='${univeristy_id}'`,
    function (err, result, fields) {
      if (err) console.log(err);
      else {
        if (result[0] == undefined) {
          con.query(
            `INSERT INTO wishlist(wishlist_id, u_email, univeristy_id) VALUES ('[value-1]','${user_mail}','	
            ${univeristy_id}')`,
            function (err, result, fields) {
              if (err) console.log(err);
              //   console.log(result);
              res.send(result);
            }
          );
        } else {
          res.json({ msg: "Already Added" });
        }
      }
    }
  );
});
app.delete("/api/wishlist", function (req, res) {
  const { univeristy_id, user_mail } = req.query;
  con.query(
    `DELETE FROM wishlist WHERE univeristy_id='${univeristy_id}' AND u_email = '${user_mail}' `,
    function (err, result, fields) {
      if (err) console.log(err);
      //   console.log(result);
      res.send(result);
    }
  );
});

//wishlist
app.get("/api/wishlist", function (req, res) {
  const { user_mail } = req.query;
  con.query(
    `SELECT wishlist_id, u_email, univeristy_id FROM wishlist WHERE u_email='${user_mail}'`,
    function (err, result, fields) {
      if (err) console.log(err);
      else {
        res.send(result);
      }
    }
  );
});

//admin
app.patch("/api/admin/universities", (req, res) => {
  console.log(req.body);
  const {
    university_name,
    description,
    university_hsc,
    university_location,
    university_ssc,
    university_surname,
    university_total,
    scholarship,
    univeristy_qsranking,
    slug,
    univeristy_id,
  } = req.body;
  con.query(
    `UPDATE university SET univeristy_qsranking='${univeristy_qsranking}',
    university_name='${university_name}',university_surname='${university_surname}',university_location='${university_location}',university_description='${description}',
    university_hsc='${university_hsc}',university_ssc='${university_ssc}',university_total='${university_total}',slug='${slug}',scholarship='${scholarship}' WHERE  univeristy_id='${univeristy_id}'`,
    function (err, result, fields) {
      if (err) console.log(err);
      else {
        res.send(result);
      }
    }
  );
});

//admin
app.post("/api/admin/universities", (req, res) => {
  const {
    university_name,
    description,
    university_hsc,
    university_location,
    university_ssc,
    university_surname,
    university_total,
    scholarship,
    univeristy_qsranking,
    slug,
  } = req.body;
  con.query(
    `INSERT INTO university(univeristy_id, univeristy_qsranking, university_name, university_surname, 
    university_location, university_description, university_hsc, university_ssc, university_total, slug, 
    scholarship) VALUES ('[value-1]','${univeristy_qsranking}','${university_name}','${university_surname}','${university_location}',
    '${description}','${university_hsc}','${university_ssc}','${university_total}','${slug}','${scholarship}')`,
    function (err, result, fields) {
      if (err) console.log(err);
      else {
        res.send(result);
      }
    }
  );
});
app.delete("/api/admin/universities", (req, res) => {
  try {
    const { univeristy_id } = req.body;
    con.query(
      `DELETE FROM university WHERE univeristy_id='${univeristy_id}'`,
      function (err, result, fields) {
        if (err) console.log(err);
        else {
          res.send(result);
        }
      }
    );
  } catch (e) {
    console.log(e);
  }
});

app.listen(port);
