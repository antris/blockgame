var React = require('react')
var {List} = require('immutable')
var pieces = require('../pieces')

var colors = {
  0: 'black',
  1: 'red',
  2: 'yellow',
  3: 'cyan',
  4: 'magenta',
  5: 'green',
  6: 'lightblue',
  7: 'orange',
  8: 'darkred',
  9: 'brown',
  10: 'darkcyan',
  11: 'purple',
  12: 'darkgreen',
  13: 'blue',
  14: 'darkorange'
}

var Cell = React.createClass({
  render: function(){
    var style = {
      display: "inline-block",
      width: "20px",
      height: "20px",
      backgroundColor: colors[this.props.cellType]
    }
    return <span style={style}></span>
  }
})

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
    return <div>
      {currentPieceInGrid(world).map((row) =>
        <div>
        {
          row.map(function(cell) {
            return <Cell cellType={cell} />
          }).toJS()
        }
        </div>
      ).toJS()}
    </div>
  }
})