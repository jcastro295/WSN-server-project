var express = require('express');
var router = express.Router();
var nodemailer = require('nodemailer');
var { check, validationResult } = require('express-validator');
var hbs = require('nodemailer-express-handlebars');

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
  res.render('contact', {title : "Contact information", success: req.session.success, errors: req.session.errors, data : req.session.data})
  req.session.success = null;
  req.session.errors = null;
});

// POST /login gets urlencoded bodies
let pingCount = 0;
router.post('/form', [
  check('email','Invalid email addreess').isEmail(),
  check('cellphone', 'Invalid cellphone number').isNumeric()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.session.errors = errors.array();
    req.session.success = false;
    req.session.data = null;
  }else{
    pingCount++;
    req.session.success = true;
    req.session.data = req.body;
    var mail = {
       from: 'wsnufpsprevention@gmail.com',
       to: req.body.email,
       subject: 'We have received your message!',
       template: 'email.contact',
       context: {
           name: req.body.name
       }
     }
     var mailserver = {
       from: 'wsnufpsprevention@gmail.com',
       to: 'wsnufpsprevention@gmail.com',
       subject: 'New comment - ' + req.body.name,
       template: 'email.info',
       context: {
           request: "# " + pingCount,
           name: req.body.name,
           email: req.body.email,
           cellphone: req.body.cellphone,
           message: req.body.comment
       }
     }
    transporter.sendMail(mail);
    transporter.sendMail(mailserver);
  }
  res.redirect('/contact');
})

module.exports = router;