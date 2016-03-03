(function () {
  'use strict';
  // Obtain ALL anchors on the page.
  var links = document.links,

  // The previous/next urls if they exist.
      prev = findHref(/(prev|back)/i),
      next = findHref(/(next|forward)/i),

  // The first/last urls if they exist.
      first = findHref(/(first|start|oldest)/i),
      last = findHref(/(last|end|newest|latest)/i);

  /**
   * Find the href for a given name.
   * @param {String} name - The name of the anchor to search for.
   * @return {String} The href for a given tag, otherwise an empty string.
   */
  function findHref(name) {
    var anchor,
      index = 0;
    for (; index < links.length; index++) {
      // The complete anchor HTML element (<a>).
      anchor = links[index];
      // Does the name exist in the anchor?
      if (isNameInAnchor(name, anchor.className) ||
          isNameInAnchor(name, anchor.rel) ||
          isNameInAnchor(name, anchor.text))
      {
        return anchor.href;
      }
      // If we didn't get anything above, try looking in the firstChildElement?
      // Some webcomics use images for these links instead of text.
      if (anchor.firstElementChild !== void 0 &&
          anchor.firstElementChild !== null)
      {
        // Check the firstElementChild's id and src attributes.
        if (isNameInAnchor(name, anchor.firstElementChild.id) ||
            isNameInAnchor(name, anchor.firstElementChild.src))
        {
          return anchor.href;
        }

        // findHref stops at first match.
        // On prev and first (line 7 and line 11), I have observed bad matches when searching alt attributes.
        // The alt attribute may contain things like "Go way back to the first strip!"
        // which will get picked up by the search for a "prev" link.
        // Should find a way around this. Disabling for now.
        // The "first" object is often before the "prev" object in the document, but not sure if this can be useful here.
        // Might have to leave out alt in an initial search and try to search again if we get no results on the first pass?

        // Check the firstElementChild's alt attribute last.
        /*if (isNameInAnchor(name, anchor.firstElementChild.alt))
        {
          return anchor.href;
        }*/
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
    return element !== void 0 && element.search(name) >= 0;
  }

  // Go to the next/previous pages using the arrow keys.
  document.addEventListener('keydown', function(event) {
    if (event.keyCode !== 37 && event.keyCode !== 39) {
      return;
    }

    var key = (event.shiftKey && "shift_" || "") + event.keyCode,
      navTo = {
        "37": prev,
        "39": next,
        "shift_37": first,
        "shift_39": last
      }[key];

    if (navTo) {
      window.location = navTo;
    }
  });
})();
