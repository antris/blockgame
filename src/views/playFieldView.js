var React = require('react')
var {List, Map} = require('immutable')
var pieces = require('../pieces')
var {EMPTY_CELL, EMPTY_GRID} = pieces
var Cell = require('./cellView')

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

var merge = (p1, p2) =>
  p1.map((row, y) =>
    row.map((cell, x) => cell === EMPTY_CELL ? p2.get(y).get(x) : cell)
  )

var withinBounds = (x, y) => x >= 0 && x < 10 && y >= 0 && y < 20

var nonEmptyCellCoordinates = function(state) {
  if (state.get('currentPiece')) {
    return state.get('currentPiece').get(state.get('pieceRotation')).flatMap(function(row, rowIndex) {
      return row.flatMap((cell, cellIndex) => cell !== EMPTY_CELL ? List.of(
        Map({
          x: cellIndex + state.get('pieceX'),
          y: rowIndex + state.get('pieceY'),
          cell: cell.set('isLocking', state.get('isLocking'))
        })
      ) : List.of())
    })
  } else {
    return List.of()
  }
}

var setCell = (grid, x, y, cell) => grid.set(y, grid.get(y).set(x, cell))

var currentPieceInGrid = function(state) {
  var putCell = function(grid, coords) {
    var x = coords.get('x')
    var y = coords.get('y')
    if (y < 0) return grid
    return grid.set(y, grid.get(y).set(x, coords.get('cell')))
  }
  var cells = nonEmptyCellCoordinates(state)
  var g = cells
    .filter((coords) => withinBounds(coords.get('x'), coords.get('y')))
    .reduce(putCell, EMPTY_GRID)
  return g
}

module.exports = React.createClass({
  render: function() {
    var world = this.props.world
    var style = { paddingTop: '20px', float: 'left', marginRight: '20px' }
    var hideAnimation = function(cell, rowIndex) {
      if (world.get('gameEnded')) {
        if (new Date().getTime() - world.get('gameEnded') > (20 - rowIndex) * 80) {
          return EMPTY_CELL
        } else {
          return cell
        }
      } else {
        return cell
      }
    }

    var shouldShowCell = (cell, rowIndex) => world.get('paused') ? EMPTY_CELL : hideAnimation(cell, rowIndex)

    return <div style={style}>
      {merge(currentPieceInGrid(world), world.get('environment')).map((row, rowIndex) =>
        <div>
        {
          row.map(function(cell) {
            return <Cell cell={shouldShowCell(cell, rowIndex)} />
          }).toJS()
        }
        </div>
      ).toJS()}
    </div>
  }
})