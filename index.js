const express = require('express');
const express_handlebars = require('express-handlebars');
const app = express();
const port = 3000;
const session = require('express-session');
const connection = require('./database');
const bcrypt = require('bcrypt');
const fileUpload = require('express-fileupload');

app.engine('handlebars', express_handlebars());

app.set('view engine', 'handlebars');

app.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 },
}
));
app.use(express.static('public'));
app.use(express.urlencoded());
app.use(session({
  secret: 'secret canvas',
  // resave: false,
  // saveUninitialized: true,
  // cookie: { secure: true }
}))

// UPLOADING 
app.get('/canvas', (req, res) => {
  res.render('canvas')
});

app.post('/canvas', (req, res) => {
  if (!req.session.userId)
    return res.send('LOGIN');
  if (!req.files.image)
    return res.send('CANVAS');
  let mimeExtentions = {
    'image/png': '.png',
    'image/jpeg': '.jpg',
    'image/gif': '.gif'
  };
  let genre = req.body.genre;
  let parentId = req.body.parentId || null;
  if (!mimeExtentions[req.files.image.mimetype])
    return res.send('WRONGFILTERTYPE');

  let extensions = mimeExtentions[req.files.image.mimetype];

  connection.query('INSERT INTO `Posts` (`author_id`,`extensions`, `genre`, `parent_id`, `timestamp`) VALUES (?,?,?,?,NOW())', [req.session.userId, extensions, genre, parentId], (error, results, fields) => {
    if (error)
      throw error;
    let insertId = results.insertId;
    req.files.image.mv('./public/gallery/' + insertId + extensions);
    return res.send('OK:' + insertId);
  });
});

//REGISTER
app.get('/register', (req, res) => {
  res.render('register')
});

app.post('/register', (req, res) => {
  let rounds = 10;
  let username = req.body.username;
  let email = req.body.email;
  let password = req.body.password;
  let confirm_password = req.body.confirm_password;
  if (!username || !password || !email || !password) {
    res.render('register', { all_fields_requied: true });
    return;
  }
  if (password !== confirm_password) {
    res.render('register', { passwords_dont_match: true });
    return;
  }
  connection.query('SELECT * FROM `Users` WHERE `username` = ?', [username], (error, results) => {
    if (results[0]) {
      res.render('register', { username_taken: true });
      return;
    }
    connection.query('SELECT * FROM `Users` WHERE `email` = ?', [email], (error, results) => {
      if (results[0]) {
        res.render('register', { email_taken: true });
        return;
      }
      bcrypt.hash(password, rounds, (err, hash) => {
        connection.query('INSERT INTO `Users` (`username`,`email`,`password`) VALUES (?,?,?)',
          [username, email, hash], (error, results) => {
            if (error)
              throw error;
            if (results)
              results.insertId;
            res.redirect('/login');
          });
      });
    });
  });
});
// LOGIN
app.get('/login', (req, res) => {
  if (req.session.userId) {
    res.redirect('/canvas');
    return;
  }
  res.render('login');
});

app.post('/login', (req, res) => {
  let username = req.body.username;
  let password = req.body.password;
  if (!username || !password) {
    res.render('login', { missingInfo: true });
  }
  else {
    connection.query('SELECT * FROM `Users` WHERE `username` = ?', [username], (err, results, fields) => {
      if (err)
        throw err;
      if (results[0]) {
        let user = results[0];
        bcrypt.compare(password, user.password, (err, result) => {
          if (err)
            throw err;
          if (result) {
            req.session.userId = user.id;
            res.redirect('/canvas');
          }
          else {
            res.render('login', { invalidCredentials: true });
          }
        });
      }
      else
        res.render('login', { invalidCredentials: true });
    });
  }
});

//LOGOUT
app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      throw err;
    }
    else {
      res.redirect('/');
    }
  });
});

// BASIC ROUTES
app.get('/', (req, res) => {
  res.render('home', { layout: 'main2' });
});

//GETTING THE ORIGINAL ARTIST

// SEND TO GALLERY
app.get('/gallery', (req, res) => {
  connection.query("SELECT `Posts`.*,`Users`.`username` FROM `Posts` LEFT JOIN `Users` ON `Users`.`id` = `Posts`.`author_id` ORDER BY `timestamp` DESC LIMIT 20", (error, results) => {
    // connection.query("SELECT `Posts`.*,`Users`.`username` FROM `Posts` LEFT JOIN `Users` ON `Users`.`id` = `Posts`.`parent_id` ORDER BY `timestamp` DESC LIMIT 20", (error, resultParent) => {
    if (error)
      throw error;
      // res.render('gallery', {parentId: resultParent});
    res.render('gallery', { images: results });
    // });
  });
});

app.get('/canvas', (req, res) => {
  res.render('canvas');
});

app.get('/user/:username', (req, res) => {
  var username = req.params.username;
  connection.query('SELECT * FROM `users` WHERE `username` = ?', [username], (error, results, fields) => {
    if (error)
      throw error;
    if (results.length === 0)
      res.render('profile', { not_found: true });
    else {
      var user = results[0];
      res.render('profile', { user: user });
    }
  });
});

//MIXER LOGIC
app.get('/remix/:image_id', (req, res) => {
  let image_id = req.params.image_id;
  connection.query("SELECT `Posts`.*,`Users`.`username` FROM `Posts` LEFT JOIN `Users` ON `Users`.`id` = `Posts`.`author_id` WHERE `Posts`.`id` = ?",[image_id], (error, results) => {
    if (error)
      throw error;
    if (!results[0])
      next();//goes to 404 handler
    else {
      let remixImage = results[0];
      let remixURL = `/gallery/${remixImage.id}${remixImage.extensions}`;
      let remixId = remixImage.id;
      res.render('canvas',{remixURL:remixURL,remixId:remixId});
    }
  });
});

//API TO DISPLAY IMAGES IN SEARCH DROP DOWN GALLERY
app.get('/api/latest_genre/:genre', (req, res) => {
  var genre = req.params.genre;
  connection.query('SELECT * FROM `posts` WHERE `genre` = ? ORDER BY `timestamp` DESC LIMIT 3', [genre], (error, results, fields) => {
    if (error)
      throw error;
    res.json(results);
  });
});



//ERROR HANDLING
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

app.use((req, res) => {
  res.status(404).render("errors_404");
});

app.use((err, res, next) => {
  if (err) {
    console.error(err.stack)
    res.status(500).render("errors_500");
  }
  else (next)
  next();
});


