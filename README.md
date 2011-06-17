# node-basecamp (API wrapper for Node.js)

A wrapper for the Basecamp API (currently only supports read methods).

## Example usage

    var http = require('http'),
        Basecamp = require('./lib/basecamp');

    var bc = new Basecamp(
      'https://YOUR_COMPANY.basecamphq.com',
      'API_KEY_HERE'
    );

    http.createServer(function (req, res) {
      bc.people.me(function (err, me) {
        if (err)
          res.end('Could not load your profile!');

        res.end('You are logged in as ' + me['first-name'] + ' ' + me['last-name']);
      });
    }).listen(8080);
    console.log('Server running at http://localhost:8080/');

## Supported methods

### projects

* `projects.all(callback)`
* `projects.count(callback)`
* `projects.load(id, callback)`

### people

* `people.me(callback)`
* `people.all(callback)`
* `people.fromProject(projectId, callback)`
* `people.fromCompany(companyId, callback)`
* `people.load(id, callback)`

### companies

* `companies.all(callback)`
* `companies.fromProject(projectId, callback)`
* `companies.load(id, callback)`

### categories

* `categories.fromProject(projectId, type_[post|attachment]_, callback)`
* `categories.load(id, callback)`

### messages

* `messages.fromProject(projectId, callback)`
* `messages.fromProjectArchive(projectId, callback)`
* `messages.load(id, callback)`
* `messages.fromCategory(projectId, categoryId, callback)`
* `messages.fromCategoryArchive(projectId, categoryId, callback)`

### comments

* `comments.fromResource(resourceType_[posts|milestones|todo\_items]_, resourceId, callback)`
* `comments.load(id, callback)`

### todoLists

* `todoLists.all(callback)`
* `todoLists.fromResponsible(responsibleId, callback)`
* `todoLists.fromProject(projectId, callback)`
* `todoLists.fromProjectPending(projectId, callback)`
* `todoLists.fromProjectFinished(projectId, callback)`
* `todoLists.load(id, callback)`

### todoItems

* `todoItems.fromList(listId, callback)`
* `todoItems.load(id, callback)`

### milestones

* `milestones.fromProject(projectId, callback)`

### time

* `time.fromProject(projectId, callback)`
* `time.fromTodo(todoId, callback)`

### files

* `files.fromProject(projectId, offset, callback)`

## TODO

* Write methods
* Publish to npm
