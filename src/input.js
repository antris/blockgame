var Bacon = require('baconjs')
var Immutable = require('immutable')

var LEFT = 37
var UP = 38
var RIGHT = 39
var DOWN = 40
var Z = 90
var X = 88
var D = 68
var P = 80
var M = 77

var keyUps = Bacon.fromEventTarget(window, 'keyup')
var keyDowns = Bacon.fromEventTarget(window, 'keydown')

var isPressed = (keyCode) =>
  keyDowns.map('.keyCode').filter((x) => x == keyCode).map(() => true)
    .merge(keyUps.map('.keyCode').filter((x) => x == keyCode).map(() => false))
    .toProperty(false)
    .skipDuplicates()

var inputStream = Bacon.combineTemplate({
  up: isPressed(UP),
  down: isPressed(DOWN),
  left: isPressed(LEFT),
  right: isPressed(RIGHT),
  z: isPressed(Z),
  x: isPressed(X),
  d: isPressed(D),
  p: isPressed(P),
  m: isPressed(M)
}).map(Immutable.Map)

//keyDowns.map('.keyCode').onValue((x) => console.log(x))

module.exports = inputStream