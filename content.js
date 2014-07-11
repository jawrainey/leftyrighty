// Obtain ALL anchors on the page.
var links = document.links;

// The previous/next urls if they exist.
var prev = findHref("prev");
var next = findHref("next");

/**
 * Find the href for a given name.
 * @param {String} The name of the anchor to search for.
 * @return {String} The href for a given tag, otherwise an empty string.
 */
function findHref(name) {
  for (var index = 0; index < links.length; ++index) {
    // The complete anchor HTML element (<a>).
    var anchor = links[index];
    // Not all anchors have text, rels or classes defined.
    var rel = (anchor.rel !== undefined) ? anchor.rel : '';
    var text = (anchor.text !== undefined) ? anchor.text.toLowerCase() : '';
    var class_name = (anchor.className !== undefined) ? anchor.className : '';
    if (rel.indexOf(name) > -1 || text.indexOf(name) > -1 || class_name.indexOf(name) > -1) {
      return anchor.href;
    }
  }
}

// Go to the next/previous pages using the arrow keys.
document.addEventListener('keydown', function(event) {
  if(event.keyCode == 37) {
    if (prev) chrome.extension.sendMessage({redirect: prev});
  }
  else if(event.keyCode == 39) {
    if (next) chrome.extension.sendMessage({redirect: next});
  }
});
