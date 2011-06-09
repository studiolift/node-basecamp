var https = require('https'),
    sys = require('sys');

var Basecamp = function(url, key) {
  this.host = url;
  this.key = new Buffer(key + ':X', 'utf8').toString('base64');

  var self = this;
  var api = {
    "projects": {
      "getAll": function (callback) { return self.request('/projects.xml', callback); },
      "getCounts": function (callback) { return self.request('/projects/count.xml', callback); },
      "getById": function (id, callback) { return self.request('/projects/' + id + '.xml', callback); }
    }
  };
  return api;
};

Basecamp.prototype.request = function(path, callback) {
  var options = {
    "host": this.host,
    "path": path,
    "headers": {
      "Authorization": 'Basic ' + this.key,
      "Host": this.host.replace('https://', ''),
      "Accept": 'application/xml',
      "Content-Type": 'application/xml',
      "User-Agent": 'NodeJS'
    }
  };

  var req = https.get(options, function(res) {
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      // Parse XML
      callback(chunk);
    });
  });
};


exports.Basecamp = Basecamp;