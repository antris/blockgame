var Immutable = require('immutable')
var Bacon = require('baconjs')
var {List, Map} = Immutable
var pieces = require('./pieces')
var inputStream = require('./input')
var EMPTY_CELL = 0
var EMPTY_ROW = Immutable.Repeat(EMPTY_CELL, 10).toList()
var EMPTY_GRID = Immutable.Repeat(EMPTY_ROW, 20).toList()

var toString = function(playField) {
  var s = '';
  playField.forEach(function(row) {
    row.forEach(function(cell) {
      s += cell;
    })
    s += '\n';
  })
  return s
}

var getRandomPiece = () => pieces.asList.get(Math.random() * pieces.asList.size)

var initialStack = Immutable.List.of(
  Map({piece: getRandomPiece(), nth: 0}),
  Map({piece: getRandomPiece(), nth: 1}),
  Map({piece: getRandomPiece(), nth: 2}),
  Map({piece: getRandomPiece(), nth: 3}),
  Map({piece: getRandomPiece(), nth: 4}),
  Map({piece: getRandomPiece(), nth: 5})
)

var currentPieceInGrid = function(state) {
  var putCell = function(grid, coords) {
    var x = coords.get(0)
    var y = coords.get(1)
    return grid.set(y, grid.get(y).set(x, pieces.colors.get(state.get('currentPiece'))))
  }
  var cells = nonEmptyCellCoordinates(state)
  var g = cells
    .filter((coords) => withinBounds(coords.get(0), coords.get(1)))
    .reduce(putCell, EMPTY_GRID)
  return g
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

var moveIsOutOfBounds = (fn, state) => nonEmptyCellCoordinates(fn(state)).some((coords) => !withinBounds(coords.get(0), coords.get(1)))

var isLegalMove = (fn, state) =>
  !moveIsOutOfBounds(fn, state) && !isOverlapping(currentPieceInGrid(fn(state)), state.get('environment'))

var nextPiece = (state) =>
  state
    .set('environment', foldGrids(state.get('environment'), currentPieceInGrid(state)))
    .set('currentPiece', state.get('nextPieces').first().get('piece'))
    .set('pieceX', 3)
    .set('pieceY', 0)
    .set('pieceRotation', 0)
    .set('nextPieces', state.get('nextPieces').slice(1).push(
      Map({ piece: getRandomPiece(), nth: state.get('nextPieces').last().get('nth') + 1 })
    ))

var moveDown = function(state) {
  if (isLegalMove(nudgeDown, state)) {
    return nudgeDown(state)
  } else {
    return nextPiece(state)
  }
}

var drop = function(state) {
  while (isLegalMove(nudgeDown, state)) {
    state = nudgeDown(state)
  }
  return state
}

var moveLeft = function(state) {
  if (isLegalMove(nudgeLeft, state)) {
    return nudgeLeft(state)
  } else {
    return state
  }
}
var moveRight = function(state) {
  if (isLegalMove(nudgeRight, state)) {
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

var gravity = Bacon.interval(1000, (state) => moveDown(state))

var cycle = function(n, max, dir) {
  if (n + dir < 0) {
    return max
  } else if (n + dir > max) {
    return 0
  } else {
    return n + dir
  }
}

var rotateRight = (state) => state.set('pieceRotation', cycle(state.get('pieceRotation'), state.get('currentPiece').size - 1, 1))
var rotateLeft = (state) => state.set('pieceRotation', cycle(state.get('pieceRotation'), state.get('currentPiece').size - 1, -1))

var actionStream = (inputType, fn) => pressedInput(inputType).map(() => (state) => fn(state))

var allActions = Bacon.mergeAll(
  actionStream("down", moveDown),
  actionStream("left", moveLeft),
  actionStream("right", moveRight),
  actionStream("up", drop),
  actionStream("z", rotateLeft),
  actionStream("x", rotateRight),
  gravity
)

var nextTick = function(state, fn) {
  var state = fn(state)
  state = removeCompleteLines(state)
  return state
}

var tick = allActions.scan(initialState, nextTick)

module.exports = {
  worldStream: tick
}