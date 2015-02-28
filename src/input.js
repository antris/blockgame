var Bacon = require('baconjs')
var Immutable = require('immutable')

var LEFT = 37
var UP = 38
var RIGHT = 39
var DOWN = 40
var Z = 90
var X = 88

var keyUps = Bacon.fromEventTarget(window, 'keyup').map('.keyCode')
var keyDowns = Bacon.fromEventTarget(window, 'keydown').map('.keyCode')

var isPressed = (keyCode) =>
  keyDowns.filter((x) => x == keyCode).map(() => true)
    .merge(keyUps.filter((x) => x == keyCode).map(() => false))
    .toProperty(false)
    .skipDuplicates()

var inputStream = Bacon.combineTemplate({
  up: isPressed(UP),
  down: isPressed(DOWN),
  left: isPressed(LEFT),
  right: isPressed(RIGHT),
  z: isPressed(Z),
  x: isPressed(X)
}).map(Immutable.Map)

keyDowns.onValue((x) => console.log(x))

module.exports = inputStream