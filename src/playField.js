var Immutable = require('immutable')
var Bacon = require('baconjs')
var {List, Map} = Immutable
var pieces = require('./pieces')
var inputStream = require('./input')
var EMPTY_CELL = 0
var EMPTY_ROW = Immutable.Repeat(EMPTY_CELL, 10).toList()
var EMPTY_GRID = Immutable.Repeat(EMPTY_ROW, 20).toList()

var getRandomPiece = () => pieces.asList.get(Math.random() * pieces.asList.size)

var initialStack = Immutable.List.of(
  Map({piece: getRandomPiece(), nth: 0}),
  Map({piece: getRandomPiece(), nth: 1}),
  Map({piece: getRandomPiece(), nth: 2}),
  Map({piece: getRandomPiece(), nth: 3}),
  Map({piece: getRandomPiece(), nth: 4}),
  Map({piece: getRandomPiece(), nth: 5})
)

var placePieceInGrid = function(grid, pieceRotations, rotation, x, y) {
  var piece = pieceRotations.get(rotation)
  var pieceHeight = piece.size
  var pieceWidth = piece.get(0).size
  var head = grid.slice(0, y)
  var body = grid.slice(y, y + pieceHeight).map(function(row, rowIndex) {
    var rowHead = row.slice(0, x)
    var rowBody = row.slice(x, x + pieceWidth).map((cell, cellIndex) => Math.max(cell, piece.get(rowIndex).get(cellIndex)))
    var rowTail = row.slice(x + pieceWidth)
    return rowHead.concat(rowBody).concat(rowTail)
  })
  var tail = grid.slice(y + pieceHeight)
  return head.concat(body).concat(tail)
}

var initialState = Immutable.Map({
  environment: EMPTY_GRID,
  currentPiece: initialStack.first().get('piece'),
  nextPieces: initialStack.slice(1),
  pieceRotation: 0,
  pieceX: 0,
  pieceY: 0
})

var foldGrids = (g1, g2) =>
  g1.map((row, rowIndex) =>
      row.map((cell, cellIndex) =>
          Math.max(cell, g2.get(rowIndex).get(cellIndex))
      )
  )

var nudgeDown = (state) => state.set('pieceY', state.get('pieceY') + 1)
var nudgeRight = (state) => state.set('pieceX', state.get('pieceX') + 1)
var nudgeLeft = (state) => state.set('pieceX', state.get('pieceX') - 1)

var isOverlapping = (g1, g2) =>
  g1.find((row, rowIndex) =>
    row.find((cell, cellIndex) =>
      cell > 0 && g2.get(rowIndex).get(cellIndex) > 0
    )
  ) !== undefined

var withinBounds = (x, y) => x >= 0 && x < 10 && y >= 0 && y < 20

var nonEmptyCellCoordinates = function(state) {
  return state.get('currentPiece').get(state.get('pieceRotation')).flatMap(function(row, rowIndex) {
    return row.flatMap((cell, cellIndex) => cell > 0 ? List.of(List.of(cellIndex + state.get('pieceX'), rowIndex + state.get('pieceY'))) : List.of())
  })
}

var pieceInGrid = (state) =>
  placePieceInGrid(EMPTY_GRID, state.get('currentPiece'), state.get('pieceRotation'), state.get('pieceX'), state.get('pieceY'))

var collidesWithBottomIfMovesDown = (state) => nonEmptyCellCoordinates(nudgeDown(state)).some((coords) => !withinBounds(coords.get(0), coords.get(1)))
var collidesWithWallIfMovesLeft = (state) => nonEmptyCellCoordinates(nudgeLeft(state)).some((coords) => !withinBounds(coords.get(0), coords.get(1)))
var collidesWithWallIfMovesRight = (state) => nonEmptyCellCoordinates(nudgeRight(state)).some((coords) => !withinBounds(coords.get(0), coords.get(1)))

var canMoveDown = (state) =>
  !collidesWithBottomIfMovesDown(state) && !isOverlapping(pieceInGrid(nudgeDown(state)), state.get('environment'))
var canMoveLeft = (state) =>
  !collidesWithWallIfMovesLeft(state) && !isOverlapping(pieceInGrid(nudgeLeft(state)), state.get('environment'))
var canMoveRight = (state) =>
  !collidesWithWallIfMovesRight(state) && !isOverlapping(pieceInGrid(nudgeRight(state)), state.get('environment'))

var nextPiece = (state) =>
  state
    .set('environment', foldGrids(state.get('environment'), pieceInGrid(state)))
    .set('currentPiece', state.get('nextPieces').first().get('piece'))
    .set('pieceX', 3)
    .set('pieceY', 0)
    .set('pieceRotation', 0)
    .set('nextPieces', state.get('nextPieces').slice(1).push(
      Map({ piece: getRandomPiece(), nth: state.get('nextPieces').last().get('nth') + 1 })
    ))

var moveDown = function(state) {
  if (collidesWithBottomIfMovesDown(state)) {
    return nextPiece(state)
  } else {
    if (canMoveDown(state)) {
      return nudgeDown(state)
    } else {
      return nextPiece(state)
    }
  }
}

var drop = function(state) {
  while (canMoveDown(state)) {
    state = nudgeDown(state)
  }
  return state
}

var moveLeft = function(state) {
  if (canMoveLeft(state)) {
    return nudgeLeft(state)
  } else {
    return state
  }
}
var moveRight = function(state) {
  if (canMoveRight(state)) {
    return nudgeRight(state)
  } else {
    return state
  }
}
var pressedInput = (inputType) =>
  inputStream
    .map((inputs) => inputs.get(inputType))
    .toEventStream()
    .skipDuplicates()
    .filter((isPressed) => isPressed)

var removeCompleteLines = function(state) {
  var incompleteLines = state.get('environment').filter((row) => row.some((cell) => cell === 0))
  var newEmptyLines = Immutable.Repeat(EMPTY_ROW, 20 - incompleteLines.size).toList()
  return state.set('environment', newEmptyLines.concat(incompleteLines))
}

var gravity = Bacon.interval(1000, { action: "MOVE_PIECE_DOWN" })

var actionStream = pressedInput("down").map(function(){ return { action: "MOVE_PIECE_DOWN" } })
  .merge(pressedInput("left").map(function(){ return { action: "MOVE_PIECE_LEFT" } }))
  .merge(pressedInput("right").map(function(){ return { action: "MOVE_PIECE_RIGHT" } }))
  .merge(pressedInput("up").map(function() { return { action: "DROP_PIECE" } }))
  .merge(pressedInput("z").map(function() { return { action: "ROTATE_PIECE_LEFT" } }))
  .merge(pressedInput("x").map(function() { return { action: "ROTATE_PIECE_RIGHT" } }))
  .merge(gravity)

var applyAction = function(state, a) {
  switch (a.action) {
    case "MOVE_PIECE_DOWN":
      return moveDown(state)
    case "MOVE_PIECE_LEFT":
      return moveLeft(state)
    case "MOVE_PIECE_RIGHT":
      return moveRight(state)
    case "DROP_PIECE":
      return drop(state)
    default:
      return state
  }
}

var nextTick = function(previousState, a) {
  var state = applyAction(previousState, a)
  state = removeCompleteLines(state)
  return state
}

var tick = actionStream.scan(initialState, nextTick)

module.exports = {
  worldStream: tick
}