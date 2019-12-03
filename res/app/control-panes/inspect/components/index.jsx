var React = require('react')
var ReactDOM = require('react-dom')
const appData = window
var Screen = require('./screen.jsx')
var Info = require('./info.jsx')
var Tree = require('./tree.jsx')
import './index.less'
var xpath = require('./libs/xpath')
var getXPath = xpath.getXPath
var getXPathLite = xpath.getXPathLite

var bounds = require('./libs/bounds')
var getNodePathByXY = bounds.getNodePathByXY

class App extends React.Component {

  constructor() {
    super()
    this.state = {
      node: null,
      tree: null,
      xpath_lite: null,
      xpath: null,
      focusBounds: null,
      treeViewPortWidth: null,
      isIOS: null,
      serverStarted: true
    }
    window.addEventListener('resize', () => this.resizeTreeViewport())
  }


  componentDidMount() {
    if (this.state.serverStarted) {
      console.log('jsonFile in componentDidMount: ', this.props.jsonFile)
      // console.log('')
      this.setState({isIOS: this.props.isIOS})
      fetch(this.props.jsonFile)
        .then(res => res.json())
        .then(tree => {
          this.setState({ tree });
        });
    } else {
      setTimeout(() => location.reload(), 3000);
    }
  }

  handleTreeSelect(node, nodePath) {
    // const { tree, isIOS } = this.state;
    const tree = this.state.tree
    this.setState({
      node,
      focusBounds: node.bounds,
      xpath_lite: getXPathLite(tree, nodePath),
      xpath: getXPath(tree, nodePath)
    });
    this.resizeTreeViewport();
  }

  handleMouseEnter(node) {
    this.setState({
      focusBounds: node.bounds
    });
  }

  handleMouseLeave(node) {
    this.setState({
      focusBounds: null
    });
  }

  handleCanvasClick(x, y) {
    const nodePath = getNodePathByXY(this.state.tree, this.state.isIOS, x, y);
    console.log('nodePath: ', nodePath)
    if (!nodePath) return;
    this.refs.tree.focus(nodePath);
    this.resizeTreeViewport();
  }

  resizeTreeViewport() {
    setTimeout(() => {
      this.refs.treeScroller && this.setState({
        treeViewPortWidth: this.refs.treeScroller.scrollWidth
      });
    });
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.jsonFile !== this.props.jsonFile) {
      console.log('In componentWillReceiveProps')
      console.log('Now jsonFile: ', this.props.jsonFile)
      console.log('New jsonFile: ', nextProps.jsonFile)
      this.setState({tree: null})
      fetch(nextProps.jsonFile)
        .then(res => res.json())
        .then(tree => {
          console.log('重新获取jsonFile')
          this.setState({ tree });
          this.setState({node: null})
          this.resizeTreeViewport()
        });
    }

  }

  render() {
    return(
      <div className="container">
        {
          this.state.tree ? (
            <div className="main">
              <div className="flex-col">
                <Screen
                  frame={this.state.focusBounds}
                  onClick={this.handleCanvasClick.bind(this)}
                  isIOS={this.props.isIOS}
                  src={this.props.img}
                />
              </div>
              <div className="flex-col" ref="treeScroller">
                <Tree
                  ref="tree"
                  width={this.state.treeViewPortWidth}
                  onSelect={this.handleTreeSelect.bind(this)}
                  onNodeMouseEnter={this.handleMouseEnter.bind(this)}
                  onNodeMouseLeave={this.handleMouseLeave.bind(this)}
                  initialData={this.state.tree}
                />
              </div>
              {
                this.state.node ? (
                  <div className="flex-col">
                    <Info
                      node={this.state.node}
                      xpath={this.state.xpath}
                      xpath_lite={this.state.xpath_lite}
                    />
                  </div>
                ) : null
              }
            </div>
          ) : (
            <div className="loading"> Waiting Device Screenshoot...</div>
          )
        }
      </div>
    )
  }
}


module.exports = App
