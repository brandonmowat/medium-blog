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

//
// Get the content of the element with ID, "id"
//
function getContent(id) {
  return document.getElementById(id).innerHTML;
}

function auth(req, username, password) {
  var name = username;
  var pass = md5(password);

  var db = req.db;

  var collection = db.get('users');

  collection.findOne({
    username: name
  }).on('success', function(doc) {
    console.log(pass);
    console.log(doc.password);
    if (pass === doc.password) {
      console.log(doc);
      return true
    } else {
      return false
    }
  });
}

/* GET post page. */
router.param('id', function(req, res, next, id) {
  console.log('The parameter "ID" is: ' + id);
  postID = id;
  next();
})

router.get('/post/:id', function(req, res, next) {
  console.log('Trying to find post id: ' + postID);
  next();
});

// Get the post wit id "id"
router.get('/post/:id', function(req, res) {
  var db = req.db;

  var collection = db.get('blogPosts');

  // try to find the post with ID "postID".
  // Find's by the default id given by mongo
  collection.findOne({
    _id: postID
  }).on('success', function(doc) {
    res.render('post', {
      title: doc.content.title,
      body: doc.content.content
    });
  });

});

router.get('/post', function(req, res) {
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
  for (var i = 0; i < ((fluffyTitle.length) - 1); i++) {
    postTitle += (fluffyTitle[i]).toLowerCase();
    postTitle += "-";
  }

  var db = req.db;

  var collection = db.get('blogPosts');

  var contentTitle = req.body.title;
  var contentBody = req.body.body;

  collection.insert({
    "date": getDate(),
    "blogTitle": postTitle,
    "content": {
      "title": contentTitle,
      "content": contentBody
    }

  }, function(err, doc) {
    if (err) {
      // If it failed, return error
      res.send("There was a problem adding the information to the database.");
    } else {
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

  var auth = req.session.auth || false;
  if (auth) {
    res.render('new-post');
  }

  var db = req.db;

  var collection = db.get('blogPosts');

  // find all the posts
  collection.find({}, function(err, docs) {
    posts = "";
    // TODO: Sort docs to post in reverse chronological order (better)
    docs.reverse(); // Hacky, but it works for now

    // in this loop, we create the html content to create the article links
    for (var i = 0; i < docs.length; i++) {
      posts += "<div class='article'>";
      posts += "<a href='/post/" + docs[i]._id + "'>";
      posts += ("<h6>" + docs[i].date + "</h6>");
      posts += ("<h2>" + docs[i].content.title + "</h2>");

      // Here, we grab the text content of the first paragraph tag so we can
      // display it in the article preview
      var body = "";
      var inP = false;
      for (var j = 0; j < docs[i].content.content.length; j++) {
        if (docs[i].content.content[j + 1] === "<") {
          if (docs[i].content.content[j + 2] === "/") {
            break;
          }
        }
        if (inP) {
          body += docs[i].content.content[j + 1];
        }
        if (docs[i].content.content[j] === "p") {
          if (docs[i].content.content[j + 1] === ">") {
            inP = true;
          }
        }
      }

      posts += "<p>" + body + "</p>"
      posts += "</a>"
      posts += "</div>";
    }
    res.render('index', {
      title: 'The Blawg',
      body: posts
    });
  });
});


router.post("/", function(req, res) {
  // Check if the user exists
  var db = req.db;

  var collection = db.get('users');

  var username = req.body.username;
  var password = req.body.password;

  var pass = md5(password);

  var db = req.db;

  var collection = db.get('users');

  console.log("Checking password...");

  // Find user to see if they actually exist
  collection.find({
    username: username
  }, function(err, doc) {
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
        // render new-post page
        req.session.auth = true; // login
        res.render("new-post");
      } else {
        // go to homepage
        res.redirect('/');
      }
    } else {
      res.redirect('/');
    }
  });
});

module.exports = router;
