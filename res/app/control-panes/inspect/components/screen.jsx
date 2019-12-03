var React = require('react')
var ReactDOM = require('react-dom')

import './screen.less'

function getIOSDprByScreenWidth(width) {
  return width > 1000 ? 3 : 2
}
class Screen extends React.PureComponent {
  constructor() {
    super()
    this.state = {
      width: 0,
      height: 0,
      frameBounds: null,
    }
  }

  get rate() {
    return this.props.isIOS ? getIOSDprByScreenWidth(this.state.width) : 1
  }

  handleImageLoad() {
    this.setState({
      width: this.refs.image.naturalWidth,
      height: this.refs.image.naturalHeight,
    }, () => {
      console.info('iOS', this.props.isIOS)
      console.info('image-width-height', this.state.width, this.state.height)
      console.info('dpr', this.rate)
    })
    this.initCanvas()
  }

  displayWidth() {
    return 320
  }

  paintFrame(frameBounds, style) {
    // console.info('framebounds', frameBounds)
    const rate = this.rate
    const cxt = this.cxt
    cxt.clearRect(0,0,this.state.width, this.state.height)
    if(frameBounds) {
      cxt.fillStyle = 'red'
      cxt.globalAlpha = 0.5
      cxt.fillRect.apply(cxt, frameBounds.map( x => x * rate))
    }

  }

  handleClick(e) {
    console.log('点击图片')
    const rate = this.rate
    const scale = this.state.width / this.displayWidth()
    var canvasBox = this.canvas.getBoundingClientRect()
    this.props.onClick(
      (e.clientX - canvasBox.left) * scale / rate,
      (e.clientY - canvasBox.top) * scale / rate
    )
  }

  initCanvas() {
    const canvas = this.refs.canvas
    this.cxt = canvas.getContext('2d')
    this.canvas = canvas
  }
  // componentWillReceiveProps(props) {
    // this.setState
  // }

  shouldComponentUpdate(nextProps, nextState) {
    //reload when img.src change
    if(this.props.src !== nextProps.src) {
      console.log('In screen shouldComponentUpdate')
      return true
    }
    if(nextProps.frame !== this.props.frame && this.cxt) {
      this.paintFrame(nextProps.frame)
    }

    return this.state !== nextState
  }

  render() {
    return (
      <div className="screen">
        <canvas
          width={this.state.width}
          height={this.state.height}
          onClick={this.handleClick.bind(this)}
          onMouseDown={e => e.preventDefault()}
          ref="canvas"
          />
        <img ref="image"
             onLoad={ this.handleImageLoad.bind(this)}
             src={this.props.src}
        />
      </div>
    )
  }

}

Screen.defaultProps = {
  onClick(){},
  frame: null,
  isIOS: true
}


module.exports = Screen
