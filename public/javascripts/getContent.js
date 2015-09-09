function setContents() {
  var tag = document.getElementById("title");
  var content = tag.innerHTML;
  document.getElementById("title_input").setAttribute("value", content);

  var tag = document.getElementById("body");
  var content = tag.innerHTML;
  document.getElementById("body_input").setAttribute("value", content);
}

$(document).ready(function() {
  $(".toggleVisibility").click( function() {
    $(".lightbox").toggleClass("visible");
    $(".animated").toggleClass("bounceIn");
  });
});
