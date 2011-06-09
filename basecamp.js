var https = require('https'),
    sys = require('sys'),
    xml2js = require('xml2js');

var Basecamp = function(url, key) {
  this.host = url;
  this.key = new Buffer(key + ':X', 'utf8').toString('base64');

  var self = this;
  var api = {
    "projects": {
      "all": function (callback) { return self.request('/projects.xml', callback); },
      "counts": function (callback) { return self.request('/projects/count.xml', callback); },
      "load": function (id, callback) { return self.request('/projects/' + id + '.xml', callback); }
    },
    "people": {
      "me": function (callback) { return self.request('/me.xml', callback); },
      "all": function (callback) { return self.request('/people.xml', callback); },
      "fromProject": function (projectId, callback) { return self.request('/projects/' + projectId + '/people.xml', callback); },
      "fromCompany": function (companyId, callback) { return self.request('/companies/' + companyId + '/people.xml', callback); },
      "load": function (id, callback) { return self.request('/people/' + id + '.xml', callback); }
    },
    "companies": {
      "all": function (callback) { return self.request('/companies.xml', callback); },
      "fromProject": function (projectId, callback) { return self.request('/projects/' + projectId + '/companies.xml', callback); },
      "load": function (id, callback) { return self.request('/people/' + id + '.xml', callback); }
    },
    "categories": {
      "fromProject": function (projectId, type, callback) { return self.request('/projects/' + projectId + '/categories.xml?type=' + type, callback); },
      "load": function (id, callback) { return self.request('/categories/' + id + '.xml', callback); }
    },
    "messages": {
      "fromProject": function (projectId, callback) { return self.request('/projects/' + projectId + '/posts.xml', callback); },
      "fromProjectArchive": function (projectId, callback) { return self.request('/projects/' + projectId + '/posts/archive.xml', callback); },
      "load": function (id, callback) { return self.request('/posts/' + id + '.xml', callback); },
      "fromCategory": function (projectId, categoryId, callback) { return self.request('/projects/' + projectId + '/cat/' + categoryId + '/posts.xml', callback); },
      "fromCategoryArchive": function (projectId, categoryId, callback) { return self.request('/projects/' + projectId + '/cat/' + categoryId + '/posts/archive.xml', callback); }
    },
    "comments": {
      "fromResource": function (resourceType, resourceId, callback) { return self.request('/' + resourceType + '/' + resourceId + '/comments.xml', callback); },
      "load": function (id, callback) { return self.request('/comments/' + id + '.xml', callback); }
    },
    "todoLists": {
      "all": function (callback) { return self.request('/todo_lists.xml', callback); },
      "fromResponsible": function (responsibleId, callback) { return self.request('/todo_lists.xml?responsible_party=' + responsibleId, callback); },
      "fromProject": function (projectId, callback) { return self.request('/projects/' + projectId + '/todo_lists.xml', callback); },
      "fromProjectPending": function (projectId, callback) { return self.request('/projects/' + projectId + '/todo_lists.xml?filter=pending', callback); },
      "fromProjectFinished": function (projectId, callback) { return self.request('/projects/' + projectId + '/todo_lists.xml?filter=finished', callback); },
      "load": function (id, callback) { return self.request('/todo_lists/' + id + '.xml', callback); }
    },
    "todoItems": {
      "fromList": function (listId, callback) { return self.request('/todo_lists/' + listId + '/todo_items.xml', callback); },
      "load": function (id, callback) { return self.request('/todo_items/' + id + '.xml', callback); }
    },
    "milestones": {
      "fromProject": function (projectId, callback) { return self.request('/projects/' + projectId + '/milestones/list.xml', callback); }
    },
    "time": {
      "fromProject": function (projectId, callback) { return self.request('/projects/' + projectId + '/time_entries.xml', callback); },
      "fromTodo": function (todoId, callback) { return self.request('/todo_items/' + todoId + '/time_entries.xml', callback); }
    },
    "files": {
      "fromProject": function (projectId, offset, callback) { return self.request('/projects/' + projectId + '/attachments.xml?n=' + offset, callback); }
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
      var parser = new xml2js.Parser();
      parser.addListener('end', function(result) {
        callback(result);
      });
      parser.parseString(xml);
    });
  });
};


exports.Basecamp = Basecamp;