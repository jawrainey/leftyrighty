/* TODO:
 *  - allow updates to includeList or excludeList to trigger updateFilters()
 *    without having to change operationMode first
 *    check dotheotherthing at (changedKey === "includedDomainsList")
 */

// add default listeners
// listen for completed navigation events and Do The Thing
chrome.webNavigation.onCompleted.addListener(dothething);
// listen for the Chrome storage to change and Do The Other Thing
chrome.storage.onChanged.addListener(dotheotherthing);

// check chrome.storage for user prefs
chrome.storage.sync.get("operationMode", function (items) {
  // Process the operationMode data
  console.log("Trying to detect operationMode from chrome.storage");
  console.log("  operationMode: " + items.operationMode);
  /* This check is to protect against the case where operationMode is undefined.
   * This can happen on a fresh install, or if operationMode somehow gets cleared/deleted.
   */
  if (items.operationMode) {
    // if operationMode is defined, switch to that operationMode
    console.log("  switching operationMode to " + items.operationMode);
    switchOperationMode(items.operationMode);
  } else {
    // if operationMode is undefined, default to originalMode
    console.log ("  operationMode undefined, trying to default to originalMode");
    /* Just set operationMode in chrome.storage.sync.
     * The chrome.storage.onChanged eventListener above will take care of actually
     * switching the mode.
     */
    chrome.storage.sync.set({ operationMode: "originalMode" });
  }
});

/* define the function with nothing just to appease
 * chrome.webNavigation.onCompleted.hasListener(_doTheNotThing)
 */
var _doTheNotThing = function() {
}

// inject the main js into the tab from callback
function dothething(details) {
  // Zhu Li!  Do the thing!
  console.log("eventPage.js:  chrome.webNavigation.onCompleted");
  console.log("  " + details.timeStamp);
  console.log("  " + details.url);
  console.log("  we gonna inject the JS here!");
  chrome.tabs.executeScript(details.tabId, {file: "content_script.js"});
  /* Do we care about this error?
   * We could try to test for a chrome:// URL,
   * or we could just let it silently fail.
   extensions::lastError:133 Unchecked runtime.lastError while running tabs.executeScript: Cannot access a chrome:// URL
    at dothething
   */
}

// attached to listener on chrome.storage.onChanged
// mostly used for switching operationMode
function dotheotherthing(changes, areaName) {
  // Do the _other_ thing!
  var changedKey = Object.keys(changes)[0];
  var newValue = changes[changedKey].newValue;
  var oldValue = changes[changedKey].oldValue;
  console.log("Do the other thing! chrome.storage.onChanged: " + areaName);
  console.log("  changedKeys: " + Object.keys(changes));
  console.log("  changedKey: " + changedKey);
  console.log("  newValue: " + newValue);
  console.log("  oldValue: " + oldValue);

  if (changedKey === "includedDomainsList" || changedKey === "excludedDomainsList" ) {
    // testing something, double checking that this is an array
    console.log("  isArray(newValue): " + Array.isArray(newValue));
    // the below line works if we're updating the urlFilter as we're adding items to the domainList
    // but we'd have to check if we're in the right operationMode
    //updateFilters(buildUrlFilters('hostSuffix', newValue));
  } else if (changedKey === "operationMode") {
    switchOperationMode(newValue);
  }
}

/* called by redefined _doTheNotThing
 * (attached to listener on chrome.webNavigation.onCompleted)
 * for excludeList
 */
function doTheNotThing(e, urlFilters) {
  // foreach ExcludeURL: if this URL does not match ALL, do nothing; if this URL does match, set fail flag and break
  console.log("doTheNotThing!");
  console.log("  " + e.timeStamp);
  console.log("  " + e.url);
  console.log("  urlFilters, array?: " + Array.isArray(urlFilters));
  console.log("  urlFilters: " + urlFilters);

  /* everything was going so well until this
   *   Error in event handler for webNavigation.onCompleted: ReferenceError: hasHostSuffix is not defined
   * It's in the Chrome examples for Filtered events, but apparently doesn't exist.
   * https://developer.chrome.com/extensions/events#filtered
   */
  var fail = false;
  for (var i = 0; i < urlFilters.length; i++) {
    if (hasHostSuffix(e.url, urlFilters[i])) {
      var fail = true;
      break;
    }
  }
  if (!fail) {
    console.log("  we gonna inject the JS here!");
    chrome.tabs.executeScript(e.tabId, {file: "content_script.js"});
  }
}

// switch operationMode
// might be able to repurpose this for updating lists
function switchOperationMode(operationMode) {
  if (operationMode === "originalMode") {
    // we'll just reset the chrome.webNavigation.onCompleted listener
    // to not take a urlFilter
    console.log("Switching to Original Mode");
    updateFilters();
  } else if (operationMode === "includeList") {
    console.log("Switching to Include List");
    chrome.storage.sync.get({ includedDomainsList: [] }, function (items) {
      updateFilters(items.includedDomainsList, "includeList");
    });
  } else if (operationMode === "excludeList") {
    chrome.storage.sync.get({ excludedDomainsList: [] }, function (items) {
      updateFilters(items.excludedDomainsList, "excludeList");
    });
  }
}

// I might need to refactor something here
function updateFilters(urlList, mode) {
  if(chrome.webNavigation.onCompleted.hasListener(dothething)) {
    console.log("removing existing listener (dothething)");
    chrome.webNavigation.onCompleted.removeListener(dothething);
  }
  if(chrome.webNavigation.onCompleted.hasListener(_doTheNotThing)) {
    console.log("removing existing listener (doTheNotThing)");
    chrome.webNavigation.onCompleted.removeListener(_doTheNotThing);
  }
  if(urlList) {
    console.log("urlList got, updating");
    console.log("  " + urlList);
    if (mode === "includeList") {
      console.log("adding listener (dothething, {url: urlList})");
      var urlFilter = buildUrlFilters('hostSuffix', items.includedDomainsList);
      chrome.webNavigation.onCompleted.addListener(dothething, {url: urlFilter});
    } else if (mode === "excludeList") {
      console.log("adding listener (doTheNotThing)");
      // FINALLY! Defining _doTheNotThing as a global var and then redefining as a function works!
      chrome.webNavigation.onCompleted.addListener(_doTheNotThing = function(details) {
        doTheNotThing(details, urlList);
      });
    }
  } else {
    console.log("adding listener (dothething)");
    chrome.webNavigation.onCompleted.addListener(dothething);
  }
}

// take an array of URLs and build a url-filter array:
// https://developer.chrome.com/extensions/events#filtered
function buildUrlFilters(filterType, urls) {
  // LOL
  /* If we accidentally pass a string to the for loop below,
  it loops over every letter in the string.  XD
  I might want to test that this is an array...  */
  var urlFilters = [];
  for (var i = 0; i < urls.length; i++) {
    var urlFilter = {};
    urlFilter[filterType] = urls[i];
    urlFilters.push(urlFilter);
  }
  return urlFilters;
}

/* Chrome's extension documentation mentions this function
 * (https://developer.chrome.com/extensions/events#filtered ),
 * but it doesn't actually exist, so we have to make one.
 */
function hasHostSuffix(url, domainSuffix) {
  var parser = document.createElement('a');
  parser.href = url;

  // parser.hostname returns full host with subdomains
  // gonna need to find a way to compare this right
  // could string search to be lazy?
  // maybe regex with /(domainSuffix)$/ to ensure end-of-string?
  // this seems like the way to go:  String.endsWith()
  console.log(" parser.hostname: " + parser.hostname);
  console.log(" parser.host: " + parser.host);
  console.log(" domainSuffix: " + domainSuffix);
  console.log(" match?: " + parser.hostname.endsWith(domainSuffix));
  
  //if (parser.hostname === domainSuffix) {
  if (parser.hostname.endsWith(domainSuffix)) {
    console.log(" got a match");
    return true;
  } else {
    return false;
  }
}
