var https = require('https'),
    sys = require('sys'),
    xml2js = require('xml2js');

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
  var self = this;
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
    var xml = '';
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      xml += chunk;
    }).on('end', function() {
      sys.log('data received');
      var parser = new xml2js.Parser();
      parser.addListener('end', function(result) {
        callback(result);
      });
      parser.parseString(xml);
    });
  });
};


exports.Basecamp = Basecamp;