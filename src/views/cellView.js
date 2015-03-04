var React = require('react')
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
    var size = this.props.size || 20
    var style = {
      display: "inline-block",
      width: size + "px",
      height: size + "px",
      backgroundColor: this.props.cell === pieces.EMPTY_CELL ? 'black' : 'white'
    }
    return <span style={style}></span>
  }
})

module.exports = Cell