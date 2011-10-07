var https = require('https'),
    xml2js = require('xml2js');

var Basecamp = function (url, key) {
  var self = this;
  this.host = url;
  this.key = new Buffer(key + ':X', 'utf8').toString('base64');

  this.api = {
    projects: {
      all: function (callback) {
        return self.request('/projects.xml', function (err, projects) {
          if (!err)
            projects = projects.project;

          callback(err, projects);
        });
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
        return self.request('/people.xml', function (err, people) {
          if (!err)
            people = people.person;

          callback(err, people);
        });
      },
      fromProject: function (projectId, callback) {
        return self.request('/projects/' + projectId + '/people.xml', function (err, people) {
          if (!err)
            people = people.person;

          callback(err, people);
        });
      },
      fromCompany: function (companyId, callback) {
        return self.request('/companies/' + companyId + '/people.xml', function (err, people) {
          if (!err)
            people = people.person;

          callback(err, people);
        });
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
        return self.request('/companies.xml', function (err, companies) {
          if (!err)
            companies = companies.company;

          callback(err, companies);
        });
      },
      fromProject: function (projectId, callback) {
        return self.request('/projects/' + projectId + '/companies.xml', function (err, companies) {
          if (!err)
            companies = companies.company;

          callback(err, companies);
        });
      },
      load: function (id, callback) {
        return self.request('/companies/' + id + '.xml', callback);
      }
    },
    categories: {
      fromProject: function (projectId, type, callback) {
        return self.request('/projects/' + projectId + '/categories.xml?type=' + type, function (err, categories) {
          if (!err)
            messages = messages.message;

          callback(err, messages);
        });
      },
      load: function (id, callback) {
        return self.request('/categories/' + id + '.xml', callback);
      }
    },
    messages: {
      "fromProject": function (projectId, callback) {
        return self.request('/projects/' + projectId + '/posts.xml', function (err, messages) {
          if (!err)
            messages = messages.message;

          callback(err, messages);
        });
      },
      fromProjectArchive: function (projectId, callback) {
        return self.request('/projects/' + projectId + '/posts/archive.xml', function (err, messages) {
          if (!err)
            messages = messages.message;

          callback(err, messages);
        });
      },
      load: function (id, callback) {
        return self.request('/posts/' + id + '.xml', callback);
      },
      fromCategory: function (projectId, categoryId, callback) {
        return self.request('/projects/' + projectId + '/cat/' + categoryId + '/posts.xml', function (err, messages) {
          if (!err)
            messages = messages.message;

          callback(err, messages);
        });
      },
      fromCategoryArchive: function (projectId, categoryId, callback) {
        return self.request('/projects/' + projectId + '/cat/' + categoryId + '/posts/archive.xml', function (err, messages) {
          if (!err)
            messages = messages.message;

          callback(err, messages);
        });
      }
    },
    comments: {
      fromResource: function (resourceType, resourceId, callback) {
        return self.request('/' + resourceType + '/' + resourceId + '/comments.xml', function (err, comments) {
          if (!err)
            comments = comments.comment;

          callback(err, comments);
        });
      },
      load: function (id, callback) {
        return self.request('/comments/' + id + '.xml', callback);
      }
    },
    todoLists: {
      all: function (callback) {
        return self.request('/todo_lists.xml', function (err, todoLists) {
          if (!err)
            todoLists = todoLists.todoList;

          callback(err, todoLists);
        });
      },
      fromResponsible: function (responsibleId, callback) {
        return self.request('/todo_lists.xml?responsible_party=' + responsibleId, function (err, todoLists) {
          if (!err)
            todoLists = todoLists.todoList;

          callback(err, todoLists);
        });
      },
      fromProject: function (projectId, callback) {
        return self.request('/projects/' + projectId + '/todo_lists.xml', function (err, todoLists) {
          if (!err)
            todoLists = todoLists.todoList;

          callback(err, todoLists);
        });
      },
      fromProjectPending: function (projectId, callback) {
        return self.request('/projects/' + projectId + '/todo_lists.xml?filter=pending', function (err, todoLists) {
          if (!err)
            todoLists = todoLists.todoList;

          callback(err, todoLists);
        });
      },
      fromProjectFinished: function (projectId, callback) {
        return self.request('/projects/' + projectId + '/todo_lists.xml?filter=finished', function (err, todoLists) {
          if (!err)
            todoLists = todoLists.todoList;

          callback(err, todoLists);
        });
      },
      load: function (id, callback) {
        return self.request('/todo_lists/' + id + '.xml', callback);
      }
    },
    todoItems: {
      "fromList": function (listId, callback) {
        return self.request('/todo_lists/' + listId + '/todo_items.xml', function (err, todoItems) {
          callback(err, todoItems);
        });
      },
      load: function (id, callback) {
        return self.request('/todo_items/' + id + '.xml', callback);
      }
    },
    milestones: {
      fromProject: function (projectId, callback) {
        return self.request('/projects/' + projectId + '/milestones/list.xml', function (err, milestones) {
          if (!err)
            milestones = milestones.milestone;

          callback(err, milestones);
        });
      }
    },
    time: {
      fromProject: function (projectId, callback) {
        return self.request('/projects/' + projectId + '/time_entries.xml', function (err, time) {
          if (!err)
            time = time.timeEntry;

          callback(err, time);
        });
      },
      fromTodo: function (todoId, callback) {
        return self.request('/todo_items/' + todoId + '/time_entries.xml', function (err, time) {
          if (!err)
            time = time.timeEntry;

          callback(err, time);
        });
      }
    },
    files: {
      fromProject: function (projectId, offset, callback) {
        return self.request('/projects/' + projectId + '/attachments.xml?n=' + offset, function (err, files) {
          if (!err)
            files = files.attachment;

          callback(err, files);
        });
      }
    }
  };

  return this.api;
};

Basecamp.prototype.request = function (path, callback) {
  function normalise(input, key) {
    var key = key || 'root',
        type = getType(input),
        norm = {};

    if (type != 'Object' && type != 'Array')
      return input;

    if (type == 'Array')
      norm = [];

    for (var sub in input) {
      if (sub == '@') continue;

      if (sub == '#') {
        switch (input[sub]) {
          case 'false':
            norm = false;
            break;
          case 'true':
            norm = true;
            break;
          default:
            norm = input[sub];
            break;
        }
      } else {
        norm[nicerKey(sub)] = normalise(input[sub], sub);
      }
    }

    return norm;
  }

  function getType(obj){
    return Object.prototype.toString.call(obj).match(/^\[object (.*)\]$/)[1]
  }

  function nicerKey(key) {
    return key.replace(/-([a-z])/g, function (g) {
     return g[1].toUpperCase();
    });
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
      if (res.statusCode != 200) {
        console.error('Basecamp API error: ' + res.statusCode + ' ' + options.path);
        callback(true, {'status': res.statusCode});
        return;
      }

      var parser = new xml2js.Parser();
      parser.addListener('end', function (result) {
        callback(false, normalise(result));
      });
      parser.parseString(xml);
    });
  });
};

module.exports = Basecamp;

