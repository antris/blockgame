var React = require('react')

var Cell = React.createClass({
  render: function(){
    var style = {
      display: "inline-block",
      width: "20px",
      height: "20px",
      backgroundColor: this.props.cellType === 0 ? "#000000" : "#ffffff"
    }
    return <span style={style}>{this.props.cellType}</span>
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

module.exports = React.createClass({
  render: function() {
    var env = this.props.environment
    return <div>
      {merge(this.props.playField, env).map((row) =>
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