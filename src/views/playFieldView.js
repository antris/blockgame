var React = require('react')

var Cell = React.createClass({
  render: () => <span>X</span>
})

module.exports = React.createClass({
  render: function() {
    return <div>
      {this.props.playField.map((row) => <div>{row.map((cell) => <Cell />).toJS()}</div>).toJS()}
    </div>
  }
})