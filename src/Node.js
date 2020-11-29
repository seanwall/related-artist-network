import React from 'react';
import './Node.css'

export default class Node extends React.Component {
    state = {
        mouseOver: false,
    }

    previewAudio = new Audio()
    previewTitle = ""

    constructor(props) {
        super(props)
    }

    componentDidMount() {
        //Preview URL is populated asynchronously in Graph.js so that rendering can take place without
        //waiting for spotify requests, need to wait for preview url promise to resolve before creating
        //preview audio object
        this.props.node.track_promise.then(track => {
            if (track) {
                if (track.preview_url) this.previewAudio = new Audio(track.preview_url)
                this.previewTitle = track.name
            }

        })
        //TODO - This is a little messy - maybe just populate node component with a promise for the preview url?
        // (async() => {
        //     while(!this.props.node.preview_url) {
        //         await new Promise(resolve => setTimeout(resolve,500))
        //     }
        //     this.previewAudio = new Audio(this.props.node.preview_url)
        // })()
    }

    handleMouseEvent = (mouse_action) => {
        switch(mouse_action) {
            case 'enter':
                console.log(this.previewTitle)
                this.setState({
                    mouseOver: true
                })
                setTimeout(() => {
                    if (this.state.mouseOver) this.previewAudio.play()
                }, 500)
                break;
            case 'leave':
                this.setState({
                    mouseOver: false
                })
                this.previewAudio.pause()
                this.previewAudio.currentTime = 0
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