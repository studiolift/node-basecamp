var https = require('https'),
    resource = require('./resource'),
    xml2js = require('xml2js');

var Basecamp = function(url, key) {
  var self = this;
  this.host = url;
  this.key = new Buffer(key + ':X', 'utf8').toString('base64');

  for (var res in resource) {
    this[res] = function() {
      return new resource[res](self);
    };
  }

  var api = {
    "projects": {
      "all": function (callback) {
        return self.request('/projects.xml', function(result){
          var projects = [];

          for (var i in result.project) {
            projects[i] = new self.Project().setData(result.project[i]);
          }

          callback(projects);
        });
      },
      "count": function (callback) {
        return self.request('/projects/count.xml', callback);
      },
      "load": function (id, callback) {
        return self.request('/projects/' + id + '.xml', function(result){
          callback(new self.Project().setData(result));
        });
      }
    },
    "people": {
      "me": function (callback) {
        return self.request('/me.xml', function(result){
          callback(new self.Person().setData(result));
        });
      },
      "all": function (callback) {
        return self.request('/people.xml', function(result){
          var people = [];

          for (var i in result.person) {
            people[i] = new self.Person().setData(result.person[i]);
          }

          callback(people);
        });
      },
      "fromProject": function (projectId, callback) {
        return self.request('/projects/' + projectId + '/people.xml', function(result){
          var people = [];

          for (var i in result.person) {
            people[i] = new self.Person().setData(result.person[i]);
          }

          callback(people);
        });
      },
      "fromCompany": function (companyId, callback) {
        return self.request('/companies/' + companyId + '/people.xml', function(result){
          var people = [];

          for (var i in result.person) {
            people[i] = new self.Person().setData(result.person[i]);
          }

          callback(people);
        });
      },
      "load": function (id, callback) {
        return self.request('/people/' + id + '.xml', function(result){
          callback(new self.Person().setData(result));
        });
      }
    },
    "companies": {
      "all": function (callback) {
        return self.request('/companies.xml', function(result){
          var companies = [];

          for (var i in result.company) {
            companies[i] = new self.Company().setData(result.company[i]);
          }

          callback(companies);
        });
      },
      "fromProject": function (projectId, callback) {
        return self.request('/projects/' + projectId + '/companies.xml', function(result){
          var companies = [];

          for (var i in result.company) {
            companies[i] = new self.Company().setData(result.company[i]);
          }

          callback(companies);
        });
      },
      "load": function (id, callback) {
        return self.request('/companies/' + id + '.xml', function(result){
          callback(new self.Company().setData(result));
        });
      }
    },
    "categories": {
      "fromProject": function (projectId, type, callback) {
        return self.request('/projects/' + projectId + '/categories.xml?type=' + type, function(result){
          var categories = [];

          for (var i in result.category) {
            categories[i] = new self.Category().setData(result.category[i]);
          }

          callback(categories);
        });
      },
      "load": function (id, callback) {
        return self.request('/categories/' + id + '.xml', function(result){
          callback(new self.Category().setData(result));
        });
      }
    },
    "messages": {
      "fromProject": function (projectId, callback) {
        return self.request('/projects/' + projectId + '/posts.xml', function(result){
          var messages = [];

          for (var i in result.message) {
            messages[i] = new self.Message().setData(result.message[i]);
          }

          callback(messages);
        });
      },
      "fromProjectArchive": function (projectId, callback) {
        return self.request('/projects/' + projectId + '/posts/archive.xml', function(result){
          var messages = [];

          for (var i in result.message) {
            messages[i] = new self.Message().setData(result.message[i]);
          }

          callback(messages);
        });
      },
      "load": function (id, callback) {
        return self.request('/posts/' + id + '.xml', function(result){
          callback(new self.Message().setData(result));
        });
      },
      "fromCategory": function (projectId, categoryId, callback) {
        return self.request('/projects/' + projectId + '/cat/' + categoryId + '/posts.xml', function(result){
          var messages = [];

          for (var i in result.message) {
            messages[i] = new self.Message().setData(result.message[i]);
          }

          callback(messages);
        });
      },
      "fromCategoryArchive": function (projectId, categoryId, callback) {
        return self.request('/projects/' + projectId + '/cat/' + categoryId + '/posts/archive.xml', function(result){
          var messages = [];

          for (var i in result.message) {
            messages[i] = new self.Message().setData(result.message[i]);
          }

          callback(messages);
        });
      }
    },
    "comments": {
      "fromResource": function (resourceType, resourceId, callback) {
        return self.request('/' + resourceType + '/' + resourceId + '/comments.xml', function(result){
          var comments = [];

          for (var i in result.comment) {
            comments[i] = new self.Comment().setData(result.comment[i]);
          }

          callback(comments);
        });
      },
      "load": function (id, callback) {
        return self.request('/comments/' + id + '.xml', function(result){
          callback(new self.Comment().setData(result));
        });
      }
    },
    "todoLists": {
      "all": function (callback) {
        return self.request('/todo_lists.xml', function(result){
          var todo_lists = [];

          for (var i in result['todo-list']) {
            todo_lists[i] = new self.TodoList().setData(result['todo-list'][i]);
          }

          callback(todo_lists);
        });
      },
      "fromResponsible": function (responsibleId, callback) {
        return self.request('/todo_lists.xml?responsible_party=' + responsibleId, function(result){
          var todo_lists = [];

          for (var i in result['todo-list']) {
            todo_lists[i] = new self.TodoList().setData(result['todo-list'][i]);
          }

          callback(todo_lists);
        });
      },
      "fromProject": function (projectId, callback) {
        return self.request('/projects/' + projectId + '/todo_lists.xml', function(result){
          var todo_lists = [];

          for (var i in result['todo-list']) {
            todo_lists[i] = new self.TodoList().setData(result['todo-list'][i]);
          }

          callback(todo_lists);
        });
      },
      "fromProjectPending": function (projectId, callback) {
        return self.request('/projects/' + projectId + '/todo_lists.xml?filter=pending', function(result){
          var todo_lists = [];

          for (var i in result['todo-list']) {
            todo_lists[i] = new self.TodoList().setData(result['todo-list'][i]);
          }

          callback(todo_lists);
        });
      },
      "fromProjectFinished": function (projectId, callback) {
        return self.request('/projects/' + projectId + '/todo_lists.xml?filter=finished', function(result){
          var todo_lists = [];

          for (var i in result['todo-list']) {
            todo_lists[i] = new self.TodoList().setData(result['todo-list'][i]);
          }

          callback(todo_lists);
        });
      },
      "load": function (id, callback) {
        return self.request('/todo_lists/' + id + '.xml', function(result){
          callback(new self.TodoList().setData(result));
        });
      }
    },
    "todoItems": {
      "fromList": function (listId, callback) {
        return self.request('/todo_lists/' + listId + '/todo_items.xml', function(result){
          var todoItems = [];

          for (var i in result['todo-items']) {
            todoItems[i] = new self.TodoItem().setData(result['todo-items'][i]);
          }

          callback(todoItems);
        });
      },
      "load": function (id, callback) {
        return self.request('/todo_items/' + id + '.xml', function(result){
          callback(new self.TodoItem().setData(result));
        });
      }
    },
    "milestones": {
      "fromProject": function (projectId, callback) {
        return self.request('/projects/' + projectId + '/milestones/list.xml', function(result){
          var milestones = [];

          for (var i in result.milestone) {
            milestones[i] = new self.Milestone().setData(result.milestone[i]);
          }

          callback(milestones);
        });
      }
    },
    "time": {
      "fromProject": function (projectId, callback) {
        return self.request('/projects/' + projectId + '/time_entries.xml', function(result){
          var time = [];

          for (var i in result['time-entries']) {
            time[i] = new self.Time().setData(result['time-entries'][i]);
          }

          callback(time);
        });
      },
      "fromTodo": function (todoId, callback) {
        return self.request('/todo_items/' + todoId + '/time_entries.xml', function(result){
          var time = [];

          for (var i in result['time-entries']) {
            time[i] = new self.Time().setData(result['time-entries'][i]);
          }

          callback(time);
        });
      }
    },
    "files": {
      "fromProject": function (projectId, offset, callback) {
        return self.request('/projects/' + projectId + '/attachments.xml?n=' + offset, function(result){
          var files = [];

          for (var i in result.attachments) {
            files[i] = new self.File().setData(result.attachments[i]);
          }

          callback(files);
        });
      }
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

module.exports = Basecamp;