var https = require('https'),
    xml2js = require('xml2js');

var Basecamp = function (url, key) {
  var self = this;
  this.host = url;
  this.key = new Buffer(key + ':X', 'utf8').toString('base64');

  this.api = {
    projects: {
      all: function (callback) {
        return self.request('/projects.xml', function (projects) { callback(projects.project); });
      },
      count: function (callback) {
        return self.request('/projects/count.xml', callback);
      },
      load: function (id, callback) {
        return self.request('/projects/' + id + '.xml', callback);
      },
      create: function (callback) {
        callback();
      }
    },
    people: {
      me: function (callback) {
        return self.request('/me.xml', callback);
      },
      all: function (callback) {
        return self.request('/people.xml', function (people) { callback(people.person); });
      },
      fromProject: function (projectId, callback) {
        return self.request('/projects/' + projectId + '/people.xml', function (people) { callback(people.person); });
      },
      fromCompany: function (companyId, callback) {
        return self.request('/companies/' + companyId + '/people.xml', function (people) { callback(people.person); });
      },
      load: function (id, callback) {
        return self.request('/people/' + id + '.xml', callback);
      },
      create: function(callback) {
        callback();
      }
    },
    companies: {
      all: function (callback) {
        return self.request('/companies.xml', function (companies) { callback(companies.company); });
      },
      fromProject: function (projectId, callback) {
        return self.request('/projects/' + projectId + '/companies.xml', function (companies) { callback(companies.company); });
      },
      load: function (id, callback) {
        return self.request('/companies/' + id + '.xml', callback);
      }
    },
    categories: {
      fromProject: function (projectId, type, callback) {
        return self.request('/projects/' + projectId + '/categories.xml?type=' + type, function (categories) { callback(categories.category); });
      },
      load: function (id, callback) {
        return self.request('/categories/' + id + '.xml', callback);
      }
    },
    messages: {
      "fromProject": function (projectId, callback) {
        return self.request('/projects/' + projectId + '/posts.xml', function (messages) { callback(messages.message); });
      },
      fromProjectArchive: function (projectId, callback) {
        return self.request('/projects/' + projectId + '/posts/archive.xml', function (messages) { callback(messages.message); });
      },
      load: function (id, callback) {
        return self.request('/posts/' + id + '.xml', callback);
      },
      fromCategory: function (projectId, categoryId, callback) {
        return self.request('/projects/' + projectId + '/cat/' + categoryId + '/posts.xml', function (messages) { callback(messages.message); });
      },
      fromCategoryArchive: function (projectId, categoryId, callback) {
        return self.request('/projects/' + projectId + '/cat/' + categoryId + '/posts/archive.xml', function (messages) { callback(messages.message); });
      }
    },
    comments: {
      fromResource: function (resourceType, resourceId, callback) {
        return self.request('/' + resourceType + '/' + resourceId + '/comments.xml', function (comments) { callback(comments.comment); });
      },
      load: function (id, callback) {
        return self.request('/comments/' + id + '.xml', callback);
      }
    },
    todoLists: {
      all: function (callback) {
        return self.request('/todo_lists.xml', function (todoLists) { callback(todoLists['todo-list']); });
      },
      fromResponsible: function (responsibleId, callback) {
        return self.request('/todo_lists.xml?responsible_party=' + responsibleId, function (todoLists) { callback(todoLists['todo-list']); });
      },
      fromProject: function (projectId, callback) {
        return self.request('/projects/' + projectId + '/todo_lists.xml', function (todoLists) { callback(todoLists['todo-list']); });
      },
      fromProjectPending: function (projectId, callback) {
        return self.request('/projects/' + projectId + '/todo_lists.xml?filter=pending', function (todoLists) { callback(todoLists['todo-list']); });
      },
      fromProjectFinished: function (projectId, callback) {
        return self.request('/projects/' + projectId + '/todo_lists.xml?filter=finished', function (todoLists) { callback(todoLists['todo-list']); });
      },
      load: function (id, callback) {
        return self.request('/todo_lists/' + id + '.xml', callback);
      }
    },
    todoItems: {
      "fromList": function (listId, callback) {
        return self.request('/todo_lists/' + listId + '/todo_items.xml', function (todoItems) { callback(todoItems['todo-item']); });
      },
      load: function (id, callback) {
        return self.request('/todo_items/' + id + '.xml', callback);
      }
    },
    milestones: {
      fromProject: function (projectId, callback) {
        return self.request('/projects/' + projectId + '/milestones/list.xml', function (milestones) { callback(milestones.milestone); });
      }
    },
    time: {
      fromProject: function (projectId, callback) {
        return self.request('/projects/' + projectId + '/time_entries.xml', function (time) { callback(time['time-entry']); });
      },
      fromTodo: function (todoId, callback) {
        return self.request('/todo_items/' + todoId + '/time_entries.xml', function (time) { callback(time['time-entry']); });
      }
    },
    files: {
      fromProject: function (projectId, offset, callback) {
        return self.request('/projects/' + projectId + '/attachments.xml?n=' + offset, function (files) { callback(files.attachment); });
      }
    }
  };

  return this.api;
};

Basecamp.prototype.request = function (path, callback) {
  function normalise(obj, key) {
    var norm = null;
    var key = key || 0;

    for (var o in obj) {
      if (o == '@') continue;

      if (norm == null) norm = {};

      if (o == '#') {
        switch (obj[o]) {
          case 'false':
            norm = false;
            break;
          case 'true':
            norm = true;
            break;
          default:
            norm = obj[o];
            break;
        }
      } else if (typeof obj[o] == 'object' || typeof obj[o] == 'array') {
        key = o;
        norm[key] = normalise(obj[o], o);
      } else {
        key = o;
        norm[key] = obj[o];
      }
    }

    return norm;
  }

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

  var req = https.get(options, function (res) {
    var xml = '';
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      xml += chunk;
    }).on('end', function () {
      var parser = new xml2js.Parser();
      parser.addListener('end', function (result) {
        callback(normalise(result));
      });
      parser.parseString(xml);
    });
  });
};

module.exports = Basecamp;

