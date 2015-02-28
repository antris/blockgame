var pieces = require('./pieces')
var Bacon = require('baconjs')
var Immutable = require('immutable')

var {Map} = Immutable

var nextStream = new Bacon.Bus()

var getRandomPiece = () => pieces.asList.get(Math.random() * pieces.asList.size)

var initialStack = Immutable.List.of(
  Map({piece: getRandomPiece(), nth: 0}),
  Map({piece: getRandomPiece(), nth: 1}),
  Map({piece: getRandomPiece(), nth: 2}),
  Map({piece: getRandomPiece(), nth: 3}),
  Map({piece: getRandomPiece(), nth: 4})
)

var popStack = function(stack) {
  return stack.slice(1).concat([Map({ piece: getRandomPiece(), nth: stack.last().get("nth") + 1 })])
}

var stackStream = nextStream.scan(initialStack, popStack)

module.exports = {
  getRandomPiece,
  stackStream,
  next: () => nextStream.push(true)
}