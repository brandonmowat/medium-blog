var express = require('express');
var router = express.Router();

var postID;

function getDate() {
    var d = new Date();
    var date = d.toLocaleDateString();
    return date;
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
