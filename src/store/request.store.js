const requests = new Map();

function save(id, record) {
  requests.set(id, record);
}

function get(id) {
  return requests.get(id);
}

module.exports = { save, get };
