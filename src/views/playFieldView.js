var React = require('react')
var {List} = require('immutable')
var pieces = require('../pieces')
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
  p1.map((y, yIndex) =>
    y.map((x, xIndex) => Math.max(x, p2.get(yIndex).get(xIndex)))
  )

var withinBounds = (x, y) => x >= 0 && x < 10 && y >= 0 && y < 20

var nonEmptyCellCoordinates = function(state) {
  if (state.get('currentPiece')) {
    return state.get('currentPiece').get(state.get('pieceRotation')).flatMap(function(row, rowIndex) {
      return row.flatMap((cell, cellIndex) => cell > 0 ? List.of(List.of(cellIndex + state.get('pieceX'), rowIndex + state.get('pieceY'))) : List.of())
    })
  } else {
    return List.of()
  }
}

var setCell = (grid, x, y, cell) => grid.set(y, grid.get(y).set(x, cell))

var currentPieceInGrid = function(state) {
  var putCell = function(grid, coords) {
    var x = coords.get(0)
    var y = coords.get(1)
    var l = state.get('isLocking') ? 7 : 0
    return setCell(grid, x, y, pieces.colors.get(state.get('currentPiece')) + l)
  }
  var cells = nonEmptyCellCoordinates(state)
  var g = cells
    .filter((coords) => withinBounds(coords.get(0), coords.get(1)))
    .reduce(putCell, state.get('environment'))
  return g
}

module.exports = React.createClass({
  render: function() {
    var world = this.props.world
    var style = { paddingTop: '20px', float: 'left', marginRight: '20px' }
    var hideAnimation = function(cell, rowIndex) {
      if (world.get('gameEnded')) {
        if (new Date().getTime() - world.get('gameEnded') > (20 - rowIndex) * 80) {
          return 0
        } else {
          return cell
        }
      } else {
        return cell
      }
    }

    var shouldShowCell = (cell, rowIndex) => world.get('paused') ? 0 : hideAnimation(cell, rowIndex)

    return <div style={style}>
      {currentPieceInGrid(world).map((row, rowIndex) =>
        <div>
        {
          row.map(function(cell) {
            return <Cell cellType={shouldShowCell(cell, rowIndex)} />
          }).toJS()
        }
        </div>
      ).toJS()}
    </div>
  }
})