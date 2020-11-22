import React from 'react';
import './Node.css'

const preview = 'https://p.scdn.co/mp3-preview/803b657c8914456ca28dfddc0add7cdad456cdac?cid=1ca97f5a0d494fcfbfb20b112a8d552f'

export default class Node extends React.Component {
    state = {
        mouseOver: false
    }
    audio = new Audio(preview)

    constructor(props) {
        super(props)
    }

    handleMouseEvent = (mouse_action) => {
        switch(mouse_action) {
            case 'enter':
                this.setState({
                    mouseOver: true
                })
                this.audio.play()
                break;
            case 'leave':
                this.setState({
                    mouseOver: false
                })
                this.audio.pause()
                this.audio.currentTime = 0
                break;
        }
    }

    render() {
        const transform = 'translate(' + this.props.node.x + ',' + this.props.node.y + ')';
        const className = this.state.mouseOver ? 'node-active':'node'
        const radius = this.props.node.popularity/4
        const x_offset = this.props.node.name.length * -4
        return (
            <g className={className} key={this.props.node.id} transform={transform}
                onClick={() => this.props.expand()}
                onMouseEnter={() => this.handleMouseEvent('enter')}
                onMouseLeave={() => this.handleMouseEvent('leave')}>
                <circle className={className} r={radius}></circle>
                <text y={radius + 7} x={x_offset} dy='.35em'>{this.props.node.name}</text>
            </g>)
    }
}