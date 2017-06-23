const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mustacheExpress = require('mustache-express');
const session = require('express-session');
var parseurl = require('parseurl');

const app = express();

let users = [
  {'username': 'stephen', 'password': '123456'},
  {'username': 'jennifer', 'password': 'puppies'},
  {'username': 'micah', 'password': 'dogs'},
  {'username': 'silas', 'password': 'babies'},
  {'username': 'porter', 'password': 'middle'}
];

app.engine('mustache', mustacheExpress());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'mustache');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extend: false}));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}));

app.use(function(req, res, next){
  var pathname = parseurl(req).pathname;

  if(!req.session.user && pathname != '/login'){
    //let qs = '?next=' + pathname ? pathname != '/login' : '';
    let qs;
    if(pathname != '/login'){
      qs = '?next=' + pathname;
    }else{
      qs = '';
    }
    res.redirect('/login' + qs);
  }else{
    next();
  }
});

app.use(function(req, res, next){
  var views = req.session.views;

  if(!views){
    // req.session.views = {};
    // views = req.session.views;
    views = req.session.views = {};
  }

  var pathname = parseurl(req).pathname;

  views[pathname] = (views[pathname] || 0) + 1;

  next();
});

app.get('/login', function(req, res){
  var context = {
    next: req.query.next
  };

  res.render('login', context);
});

app.post('/login', function(req, res){
  var username = req.body.username;
  var password = req.body.password;
  var nextPage = req.body.next || '/';

  var person = users.find(function(user){
    return user.username === username;
  });

  if(person && person.password == password){
    req.session.user = person;
  }else if (req.session.user) {
    delete req.session.user;
  }

  if(req.session.user){
    res.redirect(nextPage);
  }else{
    res.redirect('/login');
  }
});

app.get('/', function(req, res){
  var user = req.session.user;
  res.send('Welcome ' + user.username + '! you viewed this page ' + req.session.views['/'] + ' times');
});

app.listen(3000, function() {
  console.log('Listening...');
});
