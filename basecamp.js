var http = require('http'),
    sys = require('sys');

var Basecamp = function(options) {
  this.host = options.url;
  this.key = options.api_key;
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

Basecamp.prototype.request = function(url, callback) {
  var options = {
    host: this.host,
    port: 80,
    path: url,
    method: 'GET'
  }
  var req = http.request(options, function(res) {
    console.log('STATUS: ' + res.statusCode);
    console.log('HEADERS: ' + JSON.stringify(res.headers));
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      // Parse XML
      callback(chunk);
    });
  });
  req.end();
};


exports.Basecamp = Basecamp;