var React = require('react')
var Immutable = require('immutable')
var Bacon = require('baconjs')
var NextPiecesView = require('./views/nextPiecesView')
var {worldStream} = require('./playField')
var PlayField = require('./views/playFieldView')
var input = require('./input')

var history = Immutable.List.of()

var worldStreamWithHistory = worldStream.map(Immutable.Map).map(function(world) {
  history = history.push(world)
  return Immutable.Map({
    world,
    history
  })
})

var Main = React.createClass({
  getInitialState: function() { return { selectedWorldFromHistory: undefined } },
  onSlide: function() {
    var historyNth = Number(this.refs.historySlider.getDOMNode().value)
    var world = this.props.history.get(historyNth)
    this.setState({ selectedWorldFromHistory: world })
  },
  render: function() {

    var world = this.state.selectedWorldFromHistory ? this.state.selectedWorldFromHistory : this.props.world

    return <div>
      <p>History size: {this.props.history.size}</p>
      <p><input type="range" min="0" max={this.props.history.size} onChange={this.onSlide} ref="historySlider" /></p>
      <NextPiecesView pieces={world.get('nextPieces')} />
      <PlayField world={world} />
    </div>
  }
})

var Initializer = React.createClass({
  componentDidMount: function() {
    var component = this
    this.props.worldStreamWithHistory.onValue(function(x) {
      component.setState({
        world: x.get('world'), history: x.get('history') })
      }
    )
  },
  render: function() {
    return this.state && this.state.world ? <Main world={this.state.world} history={this.state.history} /> : <div />
  }
})

React.render(
  <Initializer worldStreamWithHistory={worldStreamWithHistory} />,
  document.getElementById('main')
)