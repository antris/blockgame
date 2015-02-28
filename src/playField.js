var Immutable = require('immutable')
var Bacon = require('baconjs')
var {List} = Immutable

var initialPlayField = List.of(
  List.of(0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  List.of(0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  List.of(0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  List.of(0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  List.of(0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  List.of(0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  List.of(0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  List.of(0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  List.of(0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  List.of(0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  List.of(0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  List.of(0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  List.of(0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  List.of(0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  List.of(0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  List.of(0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  List.of(0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  List.of(0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  List.of(0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
  List.of(0, 0, 0, 0, 0, 0, 0, 0, 0, 0)
)
module.exports = Bacon.once(initialPlayField)