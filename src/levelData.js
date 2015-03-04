var getLockDelay = function(state) {
  var level = state.get('level')
  if (level < 100) {
    return 60
  } else if (level < 200) {
    return 50
  } else if (level < 300) {
    return 40
  } else if (level < 400) {
    return 30
  } else if (level < 500) {
    return 25
  } else if (level < 600) {
    return 22
  } else if (level < 700) {
    return 19
  } else if (level < 800) {
    return 16
  } else if (level < 900) {
    return 13
  } else {
    return 11
  }
}

var getGravityDelay = function(state) {
  var level = state.get('level')
  if (level < 100) {
    return 30
  } else if (level < 200) {
    return 20
  } else if (level < 300) {
    return 15
  } else if (level < 400) {
    return 10
  } else if (level < 500) {
    return 6
  } else if (level < 600) {
    return 0
  } else if (level < 700) {
    return 0
  } else if (level < 800) {
    return 0
  } else if (level < 900) {
    return 0
  } else {
    return 0
  }
}

module.exports = {getLockDelay, getGravityDelay}