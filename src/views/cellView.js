var React = require('react')
var pieces = require('../pieces')
var EMPTY_CELL = pieces.EMPTY_CELL

var getColor = (cell) =>
  cell === EMPTY_CELL ? 'black' : cell.get('baseColor')

var Cell = React.createClass({
  render: function(){
    var size = this.props.size || 20
    var style = {
      display: "inline-block",
      width: size + "px",
      height: size + "px",
      backgroundColor: getColor(this.props.cell)
    }
    return <span style={style}></span>
  }
})

module.exports = Cell