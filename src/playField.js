var Immutable = require('immutable')
var Bacon = require('baconjs')
var {List} = Immutable
var pieces = require('./pieces')

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

var newPiece = Bacon.once(pieces.asMap.get("i")).delay(1000)
var getLandingSpace = (playField) => playField.slice(0, 2).map((row) => row.slice(3, 7))
var addPieceToLandingSpace = (landingSpace, piece) => landingSpace.map((row, rowIndex) =>
  row.map((cell, cellIndex) => piece.get(rowIndex).get(cellIndex) === 0 ? cell : piece.get(rowIndex).get(cellIndex))
)
var setLandingSpace = (playField, landingSpace) =>
  playField.slice(0, 2).map((row, rowIndex) =>
    row.slice(0, 3)
      .concat(row.slice(3, 7).map((cell, cellIndex) => landingSpace.get(rowIndex).get(cellIndex)))
      .concat(row.slice(7))
  ).concat(playField.slice(2, 20))
var addPieceToPlayField = function(playField, piece) {
  var landingSpace = addPieceToLandingSpace(getLandingSpace(playField), piece)
  return setLandingSpace(playField, landingSpace)
}
var playFieldStream = newPiece.scan(initialPlayField, addPieceToPlayField)

module.exports = playFieldStream