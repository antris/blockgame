var React = require('react')
var {stackStream, next} = require('./nextPiece')
var Bacon = require('baconjs')
var NextPiecesView = require('./views/nextPiecesView')

Bacon.interval(1000, true).onValue(next)

var worldStream = Bacon.combineTemplate({
  stack: stackStream
})

var Main = React.createClass({
  render: function() {
    return <NextPiecesView pieces={this.props.world.stack} />
  }
})

var Initializer = React.createClass({
  componentDidMount: function() {
    var component = this
    this.props.worldStream.onValue((world) => component.setState({ world }))
  },
  render: function() {
    return this.state && this.state.world ? <Main world={this.state.world} /> : <div />
  }
})

React.render(
  <Initializer worldStream={worldStream} />,
  document.getElementById('main')
)