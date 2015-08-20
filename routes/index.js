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
  var db = req.db;

  var collection = db.get('blogPosts');

  // try to find the post with ID "postID".
  // Will use the blogTitle ad ID
  collection.findOne({ blogTitle: postID }).on('success', function (doc) {
    res.render('post', { title: doc.content.title, body: doc.content.content });
  });

});

router.get('/post', function (req, res) {
  res.redirect("/");
});

router.get("/new-post", function (req, res) {
  res.render("new-post");
});

// Here's wher we will submit new-post info to the database
router.post('/new-post', function(req, res) {

  var contentTitle = req.body.title;
  var contentBody = req.body.body;

  var postTitle = "";
  var fluffyTitle = ((contentTitle.split(">"))[1]).split(" ");
  for (var i = 0; i < ((fluffyTitle.length)-1); i++) {
    postTitle += fluffyTitle[i];
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
router.get("/", function(req, res) {
  res.render('index', { title: 'Blog Title' });
});

module.exports = router;
