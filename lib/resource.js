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
    } else if (typeof obj[o] == 'object') {
      key = o;
      norm[key] = normalise(obj[o], o);
    } else {
      key = o;
      norm[key] = obj[o];
    }
  }

  return norm;
}

module.exports = {
  Person: function(BC) {
    this.BC = BC;
    var self = this;

    this.create = function(data, raw) {
      if (!data) return false;
      var raw = raw || false;

      if (raw)
        data = normalise(data);

      return data;
    };

    return this;
  },
};