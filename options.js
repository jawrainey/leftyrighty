// Add domain to exclusion list
function add_domain(evt) {
  evt.preventDefault();
  var domain = document.getElementById('addDomain').value;
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
      var status = document.getElementById('status');
      if (chrome.runtime.lastError) {
        status.textContent = 'ERROR: ' + chrome.runtime.lastError.message;
      } else {
        // blank out the input field
        document.getElementById('addDomain').value = "";
        status.textContent = 'Options saved.';
        setTimeout(function() {
          status.textContent = '';
        }, 1300);
      }
    });
  });
}

// Load the domains from the exclusion list
function load_domains() {
  //chrome.storage.sync.clear();
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

// Remove selected domains from the exclusion list
function remove_selected_domains() {
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
      var status = document.getElementById('status');
      if (chrome.runtime.lastError) {
        status.textContent = 'ERROR: ' + chrome.runtime.lastError.message;
      } else {
        status.textContent = 'Domain removed.';
        setTimeout(function() {
          status.textContent = '';
        }, 1300);
      }
    });
  });
}

// Clear all options
function clear_all_data() {
  chrome.storage.sync.clear();
}

document.addEventListener('DOMContentLoaded', load_domains);
/*document.getElementById('add').addEventListener('click',
    add_domain);*/
document.getElementById('excludeForm').addEventListener('submit',
    add_domain);
document.getElementById('load').addEventListener('click',
    load_domains);
document.getElementById('remove').addEventListener('click',
    remove_selected_domains);
document.getElementById('clear_all_data').addEventListener('click',
    clear_all_data);
