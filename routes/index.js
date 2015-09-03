var express = require('express');
var router = express.Router();

var md5 = require('hash-anything').md5;

var postID;
var auth = false;

function getDate() {
    var d = new Date();
    var date = d.toLocaleDateString();
    return date;
}

// Get the content of the element with ID, "id"
function getContent(id) {
  return document.getElementById(id).innerHTML;
}

// if is authenticated, continue
function isAuthenticated(req, res, next) {

  var auth = false;

  // do any checks you want to in here

  // CHECK THE USER STORED IN SESSION FOR A CUSTOM VARIABLE
  // you can do this however you want with whatever variables you set up

  if (!(auth))
    return next();
  // IF A USER ISN'T LOGGED IN, THEN REDIRECT THEM SOMEWHERE
  res.redirect('/');
}

function auth(req, username, password) {
  var name = username;
  var pass = md5(password);

  var db = req.db;

  var collection = db.get('users');

  collection.findOne({ username: name }).on('success', function (doc) {
    console.log(pass);
    console.log(doc.password);
    if (pass === doc.password) {
      console.log(doc);
      return true
    }
    else {
      return false
    }
  });
}

/* GET post page. */
router.param('id', function (req, res, next, id) {
  console.log('The parameter "ID" is: ' + id);
  postID = id;
  next();
})

router.get('/post/:id', function (req, res, next) {
  console.log('Trying to find post id: ' + postID);
  next();
});

// Get the post wit id "id"
router.get('/post/:id', function (req, res) {
  var db = req.db;

  var collection = db.get('blogPosts');

  // try to find the post with ID "postID".
  // Find's by the default id given by mongo
  collection.findOne({ _id: postID }).on('success', function (doc) {
    res.render('post', { title: doc.content.title, body: doc.content.content });
  });

});

router.get('/post', function (req, res) {
  res.redirect("/");
});

// router.get("/new-post", function (req, res, next) {
//   console.log("Require auth here.");
//
//   var pass = md5("Floppy11");
//
//   var db = req.db;
//
//   var collection = db.get('users');
//
//   collection.findOne({ username: "Brandon" }).on('success', function (doc) {
//     console.log(pass);
//     console.log(doc.password);
//     if (pass === doc.password) {
//       next();
//     }else {
//       res.redirect("/");
//     }
//   });
// });

// router.get("/new-post", isAuthenticated, function (req, res) {
//   res.render("new-post");
// });

// Here's wher we will submit new-post info to the database
router.post('/new-post', function(req, res) {



  var contentTitle = req.body.title;
  var contentBody = req.body.body;

  var postTitle = "";
  var fluffyTitle = ((contentTitle.split(">"))[1]).split(" ");
  for (var i = 0; i < ((fluffyTitle.length)-1); i++) {
    postTitle += (fluffyTitle[i]).toLowerCase();
    postTitle += "-";
  }

  var db = req.db;

  var collection = db.get('blogPosts');

  var contentTitle = req.body.title;
  var contentBody = req.body.body;

  collection.insert({
      "date" : getDate(),
      "blogTitle" : postTitle,
      "content" : {
        "title" : contentTitle,
        "content" : contentBody
      }

  }, function (err, doc) {
      if (err) {
          // If it failed, return error
          res.send("There was a problem adding the information to the database.");
      }
      else {
          // If it worked, set the header so the address bar doesn't still say /adduser
          //res.location("userlist");
          // And forward to success page
          res.redirect("/");
      }
  });
});
/*
users.insert({ a: 'b' }, function (err, doc) {
  if (err) throw err;
});

var collection = db.get('blogPosts');
var results = collection.find({title:id}, function (err, docs){
  req.post = docs;
});
*/

// here's the hompage
router.get("/", function(req, res) {
  // Want to get all the blog posts, sort them, create some html and then
  // push it to our template
  var db = req.db;

  var collection = db.get('blogPosts');

  // find all the posts
  collection.find({}, function (err, docs){
    posts = "";
    // TODO: Sort docs to post in reverse chronological order
    for (var i = 0; i < docs.length; i++) {
      posts += "<div class='article'>";
      posts += "<a href='/post/" + docs[i]._id + "'>";
      posts += ("<h2>" + docs[i].content.title + "</h2>");
      posts += ("<h6>" + docs[i].date + "</h6>");
      posts += "</a>"
      posts += "</div>";
    }
    res.render('index', { title: 'Brandon\'s Blog', body : posts });
  });
});


router.post("/", function(req, res) {
  var db = req.db;

  var collection = db.get('users');

  var username = req.body.username;
  var password = req.body.password;

  var pass = md5(password);

  var db = req.db;

  var collection = db.get('users');

  console.log("Checking password...");

  collection.find({ username: username }, function (err, doc) {
    if (err) {
      res.redirect('/');
    }
    console.log(doc);
    if (!(doc.length === 0)) {
      console.log(pass);
      console.log(doc[0].password);
      if (pass === doc[0].password) {
        console.log("Success!");
        auth = true;
        // go to new-post
        res.render("new-post");
      }else {
        // go to homepage
        res.redirect('/');
      }
    }
    else {
      res.redirect('/');
    }
  });
});

module.exports = router;
