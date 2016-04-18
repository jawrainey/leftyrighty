// Add domain to inclusion or exclusion list
function add_domain(evt) {
  evt.preventDefault();
  if (this.id === "excludeForm") {
    var domain = document.getElementById('excludeAddDomain').value;
    var opt = document.createElement('option');
    opt.text = domain;
    opt.value = domain;
    document.getElementById('excludedDomains').add(opt);

    chrome.storage.sync.get({
      excludedDomainsList: []
    }, function(items) {
      items.excludedDomainsList.push(domain);

      // Save the array back
      chrome.storage.sync.set({ excludedDomainsList: items.excludedDomainsList }, function () {
        var status_updated = try_update_status('status', 'Options saved', 1300);
        if (status_updated) {
          // blank out the input field
          document.getElementById('excludeAddDomain').value = "";
        }
      });
    });
  } else if (this.id === "includeForm") {
    var domain = document.getElementById('includeAddDomain').value;
    var opt = document.createElement('option');
    opt.text = domain;
    opt.value = domain;
    document.getElementById('includedDomains').add(opt);

    chrome.storage.sync.get({
      includedDomainsList: []
    }, function(items) {
      items.includedDomainsList.push(domain);

      // Save the array back
      chrome.storage.sync.set({ includedDomainsList: items.includedDomainsList }, function () {
        var status_updated = try_update_status("status", "Options saved", 1300);
        if (status_updated) {
          // blank out the input field
          document.getElementById('includeAddDomain').value = "";
        }
      });
    });
  }
}

// Load the domains from the inclusion and exclusion lists
function load_domains() {
  chrome.storage.sync.get({ includedDomainsList: [] }, function (items) {
    // Process the domains
    var includedDomains = document.getElementById('includedDomains');
    for (var i = 0; i < items.includedDomainsList.length; i++) {
      var url = items.includedDomainsList[i];
      var opt = document.createElement('option');
      opt.text = url;
      opt.value = url;
      includedDomains.add(opt);
    }
  });
  chrome.storage.sync.get({ excludedDomainsList: [] }, function (items) {
    // Process the domains
    var excludedDomains = document.getElementById('excludedDomains');
    for (var i = 0; i < items.excludedDomainsList.length; i++) {
      var url = items.excludedDomainsList[i];
      var opt = document.createElement('option');
      opt.text = url;
      opt.value = url;
      excludedDomains.add(opt);
    }
  });
}

// Remove selected domains from the inclusion or exclusion list
function remove_selected_domains() {
  if (this.id === "excludeRemove") {
    var excludedDomains = document.getElementById('excludedDomains');
    var excludedDomainsRemoveList = [];
    for (var i = excludedDomains.length - 1; i >= 0; i--) {
      if (excludedDomains.options[i].selected) {
        excludedDomainsRemoveList.push(excludedDomains.options[i].text);
        excludedDomains.remove(i);
      }
    }

    chrome.storage.sync.get({
      excludedDomainsList: []
    }, function(items) {
      var excludedDomainsRemoveIndexes = [];
      for (var i = 0; i < excludedDomainsRemoveList.length; i++) {
        // splice out domains marked for removal
        items.excludedDomainsList.splice(items.excludedDomainsList.indexOf(excludedDomainsRemoveList[i]), 1);
      }

      // Save the array back
      chrome.storage.sync.set({ excludedDomainsList: items.excludedDomainsList }, function () {
        try_update_status("status", "Selected domains removed", 1300);
      });
    });
  } else if (this.id === "includeRemove") {
    var includedDomains = document.getElementById('includedDomains');
    var includedDomainsRemoveList = [];
    for (var i = includedDomains.length - 1; i >= 0; i--) {
      if (includedDomains.options[i].selected) {
        includedDomainsRemoveList.push(includedDomains.options[i].text);
        includedDomains.remove(i);
      }
    }

    chrome.storage.sync.get({
      includedDomainsList: []
    }, function(items) {
      var includedDomainsRemoveIndexes = [];
      for (var i = 0; i < includedDomainsRemoveList.length; i++) {
        // splice out domains marked for removal
        items.includedDomainsList.splice(items.includedDomainsList.indexOf(includedDomainsRemoveList[i]), 1);
      }

      // Save the array back
      chrome.storage.sync.set({ includedDomainsList: items.includedDomainsList }, function () {
        try_update_status("status", "Selected domains removed", 1300);
      });
    });
  }
}

// Clear all saved option data
function clear_all_data() {
  chrome.storage.sync.clear();
}

// wrapper for "update_status" to reduce code duplication with checking chrome.runtime.lastError
function try_update_status(eId, msg, timeout) {
  var success = true;
  if (chrome.runtime.lastError) {
    msg = 'ERROR: ' + chrome.runtime.lastError.message;
    timeout = -1;
    success = false;
  }
  update_status(eId, msg, timeout);
  return success;
}

// Update status element with a status message
function update_status(eId, msg, timeout) {
  var elStatus = document.getElementById(eId);
  elStatus.textContent = msg;
  if (Number.isInteger(timeout) && timeout >= 0) {
    setTimeout(function() {
      elStatus.textContent = '';
    }, timeout);
  }
}

// swap visibility of option tabs
function toggle_tabs() {
  // get currently active tab that we're navigating away from
  var activeTab = document.getElementById("tabs").getElementsByClassName("activeTab")[0];

  // Swap the active tab
  this.classList.add("activeTab");
  activeTab.classList.remove("activeTab");
  // Swap the active tab-contents
  document.getElementById(this.id + "Content").classList.remove("hidden");
  document.getElementById(activeTab.id + "Content").classList.add("hidden");
  // Toggle the eventListeners
  this.removeEventListener("click", toggle_tabs);
  activeTab.addEventListener("click", toggle_tabs);
}

// Save the main/general options
function save_main_options() {
  chrome.storage.sync.set({ operationMode: this.value}, function (items) {
    try_update_status('status', 'Options saved', 1300);
  });
}

// Load the main/general options
function load_main_options() {
  chrome.storage.sync.get( "operationMode" , function (items) {
    // Process the operationMode data
    var radioGroupOperationModes = document.getElementsByName('operationMode');
    for (var i = 0; i < radioGroupOperationModes.length; i++) {
      if (radioGroupOperationModes[i].value === items.operationMode) {
        radioGroupOperationModes[i].checked = true;
      } else {
        radioGroupOperationModes[i].checked = false;
      }
    }
  });
}

// load all user saved preferences
function load_all_preferences() {
  // load the domains
  load_domains();
  // load the main options
  load_main_options();
}


document.addEventListener('DOMContentLoaded', load_all_preferences);
// we don't need to add the listener for the tab that is open by default
//document.getElementById('includeTab').addEventListener('click', toggle_tabs);
document.getElementById('excludeTab').addEventListener('click', toggle_tabs);
document.getElementById('mainOptionsTab').addEventListener('click', toggle_tabs);
document.getElementById('includeForm').addEventListener('submit', add_domain);
document.getElementById('includeRemove').addEventListener('click', remove_selected_domains);
document.getElementById('excludeForm').addEventListener('submit', add_domain);
document.getElementById('excludeRemove').addEventListener('click', remove_selected_domains);
document.getElementById('load').addEventListener('click', load_all_preferences);
document.getElementById('clear_all_data').addEventListener('click', clear_all_data);
document.getElementsByName('operationMode')[0].addEventListener('click', save_main_options);
document.getElementsByName('operationMode')[1].addEventListener('click', save_main_options);
document.getElementsByName('operationMode')[2].addEventListener('click', save_main_options);
