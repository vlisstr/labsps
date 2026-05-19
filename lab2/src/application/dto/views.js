'use strict';

function userToView(user) {
  return { id: user.id, username: user.username.value };
}

function itemToView(item) {
  return {
    id: item.id,
    name: item.name.value,
    description: item.description.value,
    ownerId: item.ownerId,
  };
}

module.exports = { userToView, itemToView };
