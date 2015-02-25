// Obtain ALL anchors on the page.
var links = document.links;

// The previous/next urls if they exist.
var prev = findHref(/(prev|back)/i);
var next = findHref(/(next|forward)/i);

// The first/last urls if they exist.
var first = findHref(/(first|start|oldest)/i);
var last = findHref(/(last|end|newest|latest)/i);

/**
 * Find the href for a given name.
 * @param {String} name - The name of the anchor to search for.
 * @return {String} The href for a given tag, otherwise an empty string.
 */
function findHref(name) {
  for (var index = 0; index < links.length; ++index) {
    // The complete anchor HTML element (<a>).
    var anchor = links[index];
    // Does the name exist in the anchor?
    if (isNameInAnchor(name, anchor.className) ||
        isNameInAnchor(name, anchor.rel) ||
        isNameInAnchor(name, anchor.text))
    {
      return anchor.href
    }
  }
}

/**
 * Does the word exist in a given element?
 * @param {String} name - The name to search for.
 * @param {String} element - The element to search in.
 * @return {Boolean} True if the name exists in the element, otherwise false.
 */
function isNameInAnchor(name, element) {
  return (element !== undefined && element.search(name) >= 0);
}

// Go to the next/previous pages using the arrow keys.
document.addEventListener('keydown', function(event) {
  if(event.keyCode == 37) {
    if (event.shiftKey) {
      if (first) window.location = first;
    }
    else
    {
      if (prev) window.location = prev;
    }
  }
  else if(event.keyCode == 39) {
    if (event.shiftKey) {
      if (last) window.location = last;
    }
    else
    {
      if (next) window.location = next;
    }
  }
});
