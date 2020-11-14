var express = require('express');
var router = express.Router();
var { check, validationResult } = require('express-validator');
var bcrypt = require('bcrypt');
const SALT_WORK_FACTOR = 10;
var hbs = require('nodemailer-express-handlebars');
var nodemailer = require('nodemailer');
var async = require('async');
var crypto = require('crypto');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userDataSchema = new Schema({
  username: {type: String, required: true}, 
  email: {type: String, required: true},
  password: {type: String, required: true},
  resetPasswordToken: String,
  resetPasswordExpires: Date
}, {collection: 'userData'});

var userData = mongoose.model('userData', userDataSchema);

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'wsnufpsprevention@gmail.com',
    pass: 'melancholy95'
  }
});
transporter.use('compile', hbs({
  viewEngine: {
    extName: '.hbs',
    partialsDir: 'views/',
    layoutsDir: 'views/',
    defaultLayout: 'email.layout.hbs',
  },
  viewPath: 'views/',
  extName: '.hbs',
}));

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('users', {title: "Users information", success: req.session.success, errors: req.session.errors, data : req.session.data, status: req.session.status})
  req.session.errors = null;
  req.session.success = null;
  req.session.data = null;
  req.session.status = null;
});

router.get('/account/:user', function(req, res, next) {
  if(req.session.success){
    res.render('account', {title: "Welcome", success: req.session.success, errors: req.session.errors, data: req.params.user})
  }else{
    res.status(404);
    res.render('error', {message: "Sorry, page not found!", error: { status: "404"}});
  }
  req.session.errors = null;
  req.session.success = null;
});

router.post('/signup', [
  check('username_signup','Username must be at least 6 characters').isLength({ min: 6 })
  .custom((value,{req}) => {
            if (value == req.body.password_signup) {
                // trow error if username = password
                throw new Error("Username and password must be different");
            } else {
                return value;
            }
        })
  .custom(value => !/\s/.test(value)).withMessage('No spaces are allowed in the username')
  .custom((value, {req}) => {
    return new Promise((resolve, reject) => {
      userData.findOne({username: req.body.username_signup}, function(err, doc) {
        if (err) {
          reject(new Error("Server error"));
        }
        if (Boolean(doc)){
          reject(new Error("Username is already in use"));
        }
        resolve(true)
      });
    });
  }),
  check('email_signup','Invalid email address').isEmail()
  .custom((value, {req}) => {
    return new Promise((resolve, reject) => {
      userData.findOne({email: req.body.email_signup}, function(err, doc) {
        if (err) {
          reject(new Error("Server error"));
        }
        if (Boolean(doc)){
          reject(new Error("Email is already in use"));
        }
        resolve(true)
      });
    });
  }),
  // password must be at least 5 chars long
  check('password_signup', 'Password must be at least 6 characters').isLength({ min: 6 })
  .matches(/\d/).withMessage('Password must contain a number')
  .custom(value => !/\s/.test(value)).withMessage('No spaces are allowed in the password')
  .custom((value,{req}) => {
            if (value !== req.body.cpassword_signup) {
                // trow error if passwords do not match
                throw new Error("Passwords do not match");
            } else {
                return value;
            }
        })
], (req, res) => {
  // Finds the validation errors in this request and wraps them in an object with handy functions
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.session.errors = errors.array();
    req.session.success = false;
    req.session.data = null;
  }else{
    req.session.status = true;
    req.session.success = true;
    req.session.data = {
      username: req.body.username_signup,
      email: req.body.email_signup
    };
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
      if (err) return next(err);

    // hash the password using our new salt
      bcrypt.hash(req.body.password_signup, salt, function(err, hash) {
        if (err) return next(err);
        // override the cleartext password with the hashed one
        var item = {
          username: req.body.username_signup,
          email : req.body.email_signup,
          password: hash 
        };
        var data = new userData(item);
        data.save();
      });
    });
  }
  res.redirect('/users');
});

router.post('/login', [
  check('username_login')
  .custom((value, {req}) => {
    return new Promise((resolve, reject) => {
      userData.findOne({$or: [
        {username: req.body.username_login}, 
        { email: req.body.username_login}
        ]}, function(err, doc) {
        if (err) {
          reject(new Error("Server error"));
        }
        if (doc == null){
          reject(new Error("Username/email is not registered"));
        }else{
          bcrypt.compare(req.body.password_login, doc.password).then(function(res) {
            if(!res) {
              reject(new Error("Password is incorrect"));
            }else{
              resolve(true)
            }
          });
        }
      });
    });
  })
], (req, res) => {
  // Finds the validation errors in this request and wraps them in an object with handy functions
  const errors = validationResult(req);
  req.session.status = true;
  if (!errors.isEmpty()) {
    req.session.errors = errors.array();
    req.session.success = false;
    res.redirect('/users');
  }else{
    req.session.success = true;
    userData.findOne({$or: [
        {username: req.body.username_login}, 
        { email: req.body.username_login}
        ]}, function(err, doc) {
          if(!err){
            res.redirect('/users/account/' + doc.username);
          }else{
            req.session.errors = err;
            req.session.success = false;
            res.redirect('/users');
          }       
    });
  }
});


router.get('/identify', function(req, res, next) {
  res.render('identify', {title: 'Forgot password', success: req.session.success, errors: req.session.errors, data: req.session.data});
  req.session.errors = null;
  req.session.success = null;
});

router.post('/identify', function(req, res, next) {
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      userData.findOne({$or: [
        {username: req.body.r_username}, 
        { email: req.body.r_username}
        ]}, function(err, doc) {
        if (!doc) {
          var error = new Error("No account with that username and email address exists.");
          req.session.errors = error.message;
          req.session.success = false;
          return res.redirect('identify');
        }else{
          doc.resetPasswordToken = token;
          doc.resetPasswordExpires = Date.now() + 86400000; // 24 hours

          doc.save(function(err) {
          done(err, token, doc);
        });
        }
      });
    },
    function(token, doc, done) {
      
      var mail = {
       from: 'wsnufpsprevention@gmail.com',
       to: doc.email,
       subject: 'Reset your password',
       template: 'email.recover',
       context: {
           token: token,
           username : doc.username
       }
     }
      transporter.sendMail(mail, function(err){
        done(err, doc);
      }); 
    }
  ], function(err, doc) {
    if (err){
      req.session.errors = err.message;
      req.session.success = false;
      req.session.data = null;
    }else{
      req.session.success = true;
      req.session.data = {
        name : doc.username,
        email : doc.email
      }
    }
    res.redirect('identify');
  });
});

router.get('/reset/:token', function(req, res) {
    userData.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, doc) {
    if (!doc) {
      var error = new Error("Password reset token is invalid or has expired.");
      req.session.errors = null;
      req.session.success = false;
      req.session.data  = null;
      return res.render('reset', {title : 'Reset password', errors : req.session.errors, errorpage : error.message, success: req.session.success, data: req.session.data, token: req.params.token}); 
    }
    res.render('reset', {title : 'Reset password', errorpage : null, errors: null, success: false, data: doc, token: req.params.token});
  });
  req.session.errors = null;
  req.session.success = null;
  req.session.data  = null;
});

router.post('/reset/:token', [
  check('r_pass', 'Password must be at least 6 characters').isLength({ min: 6 })
    .matches(/\d/).withMessage('Password must contain a number')
    .custom(value => !/\s/.test(value)).withMessage('No spaces are allowed in the password')
    .custom((value,{req}) => {
              if (value !== req.body.r_cpass) {
                  // trow error if passwords do not match
                  throw new Error("Passwords do not match");
              } else {
                  return value;
              }
          })
  ],
  function(req, res) {
  async.waterfall([
    function(done) {
      userData.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, doc) {
        if (!doc) {
          var error = new Error("Password reset token is invalid or has expired.");
          req.session.success = false;
          req.session.data  = null;
          req.session.errors = null;
          return res.render('reset', {title : 'Reset password', errorpage : error.message, errors : req.session.errors, success: req.session.success, data: req.session.data, token: req.params.token});
        }

        done(err,doc);
      });
    },
    function(doc,done){
      const errors = validationResult(req);
      if(!errors.isEmpty()) {
        req.session.success = false;
        req.session.data  = null;
        req.session.errors = errors.array();
        return res.render('reset', {title : 'Reset password', errorpage : null, errors : req.session.errors, data: doc, success: req.session.success, token: req.params.token});
      }else{
        
        bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) return next(err);
          // hash the password using our new salt
          bcrypt.hash(req.body.r_pass, salt, function(err, hash) {
            if (err) return next(err);
            // override the cleartext password with the hashed one
            
            userData.findOneAndUpdate({resetPasswordToken: req.params.token}, {password: hash, resetPasswordToken : undefined, resetPasswordExpires : undefined }, function(err, doc) {
              done(err,doc); 
            });
          });
        });
      }
    },
    function(doc,done){
      var mail = {
       from: 'wsnufpsprevention@gmail.com',
       to: doc.email,
       subject: 'Your password has been updated sucessfully',
       template: 'email.update',
       context: {
          username : doc.username
        }
      }
      transporter.sendMail(mail, function(err){
        done(err, doc);
      }); 
    }
  ], function(err, doc) {
    if (err){
      req.session.errors = err.message;
      req.session.success = false;
      req.session.data = null;
    }else{
      req.session.success = true;
      req.session.data = {
        name : doc.username,
        email : doc.email
      }
      req.session.errors = null;
    }
    res.render('reset', {title : 'Reset password', errors : req.session.errors, errorpage : null, success: req.session.success, data: req.session.data, token: req.params.token}); 
    req.session.success = null;
    req.session.errors = null;
    req.session.data = null;
    req.session.status = true;
  });
});

module.exports = router;