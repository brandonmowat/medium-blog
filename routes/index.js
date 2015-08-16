var express = require('express');
var router = express.Router();

var postID;

function getDate() {
    var d = new Date();
    var date = d.toLocaleDateString();
    return date;
}

// Get the content of the element with ID, "id"
function getContent(id) {
  return document.getElementById(id).innerHTML;
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

router.get('/post/:id', function (req, res) {
  console.log('and this matches too');
  res.render('post', { postTitle: 'Post Title. Post number: ' + postID, postDate:"Post date." + getDate() });

});

router.get("/new-post", function (req, res) {
  res.render("new-post");
});

// Here's wher we will submit new-post info to the database
router.post('/new-post', function(req, res) {

  var contentTitle = req.body.title;
  var contentBody = req.body.body;

  res.render('post', { postTitle: 'Post Title. Post number: ' + postID, postDate:"content: " + contentBody });

  var db = req.db;

  var collection = db.get('blogPosts');

  var contentTitle = req.body.title;
  var contentBody = req.body.body;

  collection.insert({
      "date" : getDate(),
      "blogTitle" : "the-blogs-porper-URL-title",
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
router.get("/", function(req, res) {
  res.render('index', { title: 'Blog Title' });
});

module.exports = router;
