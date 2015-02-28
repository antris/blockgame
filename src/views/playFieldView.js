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

module.exports = React.createClass({
  render: function() {
    var env = this.props.environment
    return <div>
      {this.props.playField.map((row, rowIndex) =>
        <div>{
          row.map(function(cell, cellIndex) {
            var cellType = Math.max(cell, env.get(rowIndex).get(cellIndex))
            return <Cell cellType={cellType} />
          }).toJS()
        }</div>
      ).toJS()}
    </div>
  }
})