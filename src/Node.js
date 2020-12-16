import React from 'react';
import './Node.css'

export default class Node extends React.Component {
    state = {
        mouse_over: false,
    }

    preview_audio;
    track_title = ""

    constructor(props) {
        super(props)
    }

    componentDidMount() {
        this.initializePreview()
    }

    componentDidUpdate(prevProps) {
        if(this.props.node.id !== prevProps.node.id) {
            this.preview_audio = null;
            this.track_title = "";

            this.initializePreview()
        }
    }

    initializePreview = () => {
        // Track URL is populated asynchronously in Graph.js so that rendering can take place without
        // waiting for spotify requests, need to wait for track url promise to resolve before creating
        // preview audio object
        this.props.node.track_promise.then(track => {
            if (track) {
                if (track.preview_url) this.preview_audio = new Audio(track.preview_url)
                this.track_title = track.name
            }

        })
    }

    handleMouseHover = (mouse_action) => {
        switch(mouse_action) {
            case 'over':
                if(!this.state.mouse_over) {
                    this.props.setHovered(this.props.node.id)
                    this.setState({
                        mouse_over: true
                    })

                    if (this.preview_audio) {
                        setTimeout(() => {
                            //Check that 'mouseOver' still true before playing audio
                            if (this.state.mouse_over) this.preview_audio.play()
                        }, 500)
                    }
                }

                break;
            case 'leave':
                this.props.setHovered(null)
                this.setState({
                    mouse_over: false
                })

                if (this.preview_audio) {
                    this.preview_audio.pause()
                    this.preview_audio.currentTime = 0
                }

                break;
        }
    }

    getClassName() {
        if(this.state.mouse_over) {
            return 'active-node'
        }
        else if(this.props.node.sources && this.props.node.sources.includes(this.props.hovered_node_id)) {
            return 'child-node'
        }
        else if(this.props.node.targets && this.props.node.targets.includes(this.props.hovered_node_id)){
            return 'parent-node'
        }
        else {
            return 'hidden-node'
        }
    }

    render() {
        const transform = this.props.getNodeTransform();
        const className = this.getClassName()
        const radius = this.props.getRadius()
        const x_preview_text = this.props.view_pos.x + window.innerWidth - 20
        const y_preview_text = this.props.view_pos.y + 25
        const preview_text = <tspan className='preview-text' y={y_preview_text} x={x_preview_text}>{this.props.node.name} - {this.track_title}</tspan>

        return (
            <g className={className} id={this.props.node.id} key={this.props.node.id}
                onClick={() => this.props.expand()}
                onMouseLeave={() => this.handleMouseHover('leave')}
                onMouseOver={() => this.handleMouseHover('over')}>
                {
                    this.state.mouse_over &&
                    <text id={`${this.props.node.id}-preview`} textAnchor={"end"}>
                        {React.cloneElement(preview_text, {className: 'preview-underlay'})}
                        {React.cloneElement(preview_text, {className: 'preview-fill'})}
                        {
                            !this.preview_audio &&
                            <tspan fill="red" y={y_preview_text + 20} x={x_preview_text}>No audio sample available</tspan>
                        }
                    </text>
                }
                <circle transform={transform} className={className} r={radius}></circle>
                            </g>)
    }
}