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
    return <div>
      {this.props.playField.map((row) => <div>{row.map((cell) => <Cell cellType={cell} />).toJS()}</div>).toJS()}
    </div>
  }
})