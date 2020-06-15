const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const redis = require('redis');

// create redis client
let client = redis.createClient();

client.on('connect', function () {
    console.log('connected to redis');
});

// set port
const port = 3000;

// init app
const app = express();

// view engine
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// method override - for calling delete method from the form
app.use(methodOverride('_method'));

// search page
app.get('/', (req, res, next) => {
   res.render('searchusers');
});

// search processing
app.post('/users/search', (req, res, next) => {
    let id = req.body.id;

    console.log('id is: ', id);

    client.hgetall(id, function (err, obj) {
        if (!obj) {
            res.render('searchusers', {
                error: 'user does not exists'
            });
        } else {
            obj.id = id;
            console.log(obj);
            res.render('details', {
                user: obj
            });
        }
    })
});

// add user page
app.get('/user/add', (req, res, next) => {
    res.render('adduser');
});

// process add user page
app.post('/users/add', (req, res, next) => {
    const id = req.body.id;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const email = req.body.email;
    const phone = req.body.phone;

    console.log(id, firstName, lastName, email, phone);
    client.hmset(id, [
        'firstName', firstName,
        'lastName', lastName,
        'email', email,
        'phone', phone
    ], function (err, reply) {
        if (err) {
            console.log(err);
        }
        console.log(reply);
        res.redirect('/');
    });
});

// delete user
app.delete('/users/delete/:id', (req,res, next) => {
    client.del(req.params.id);
    res.redirect('/');
});

// search
app.listen(port, function() {
    console.log('started server on port: ', port)
});
