import React from 'react';
import './Node.css'

export default class Node extends React.Component {
    state = {
        mouseOver: false,
    }

    previewAudio;
    previewTitle = ""

    constructor(props) {
        super(props)
    }

    componentDidMount() {
        // Track URL is populated asynchronously in Graph.js so that rendering can take place without
        // waiting for spotify requests, need to wait for track url promise to resolve before creating
        // preview audio object
        this.props.node.track_promise.then(track => {
            if (track) {
                if (track.preview_url) this.previewAudio = new Audio(track.preview_url)
                this.previewTitle = track.name
            }

        })
    }

    handleMouseEvent = (mouse_action) => {
        switch(mouse_action) {
            case 'enter':
                this.props.setHovered(this.props.node.id)
                this.setState({
                    mouseOver: true
                })

                if (this.previewAudio) {
                    setTimeout(() => {
                        //Check that 'mouseOver' still true before playing audio
                        if (this.state.mouseOver) this.previewAudio.play()
                    }, 500)
                }

                break;
            case 'leave':
                this.props.setHovered(null)
                this.setState({
                    mouseOver: false
                })

                if (this.previewAudio) {
                    this.previewAudio.pause()
                    this.previewAudio.currentTime = 0
                }

                break;
        }
    }

    getClassName() {
        if(this.state.mouseOver) {
            return 'node-active'
        }
        else if(this.props.node.sources && this.props.node.sources.includes(this.props.hovered_node)) {
            return 'node-child'
        }
        else if(this.props.node.targets && this.props.node.targets.includes(this.props.hovered_node)){
            return 'node-parent'
        }
        else {
            return 'node'
        }
    }

    render() {
        const transform = 'translate(' + this.props.node.x + ',' + this.props.node.y + ')';
        const className = this.getClassName()
        const radius = this.props.node.popularity/4
        const previewTextX = window.pageXOffset + window.innerWidth - 20
        const previewTextY = window.pageYOffset + 20

        return (
            <g className={className} key={this.props.node.id}
                onClick={() => this.props.expand()}
                onMouseEnter={() => this.handleMouseEvent('enter')}
                onMouseLeave={() => this.handleMouseEvent('leave')}>
                {
                    this.state.mouseOver &&
                    <text textAnchor={"end"}>
                        <tspan y={previewTextY} x={previewTextX}>{this.props.node.name} - {this.previewTitle}</tspan>
                        {
                            !this.previewAudio &&
                            <tspan fill="red" y={previewTextY + 17} x={previewTextX}>No preview track available</tspan>
                        }
                    </text>
                }
                <circle transform={transform} className={className} r={radius}></circle>
                <text textAnchor={"middle"} y={this.props.node.y + radius + 7} x={this.props.node.x} dy='.35em'>{this.props.node.name}</text>
            </g>)
    }
}