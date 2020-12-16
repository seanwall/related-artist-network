import React from 'react';
import './Label.css'

export default class Label extends React.Component {
    constructor(props) {
        super(props)
    }

    state = {
        is_highlighted: false
    }

    track_id = ''

    componentDidMount() {
        this.initializeNodeInfo()
    }

    componentDidUpdate(prevProps) {
        if(this.props.hovered_node_id !== prevProps.hovered_node_id ||
           this.props.node.id !== prevProps.node.id) {
            this.initializeNodeInfo()
        }
    }

    initializeNodeInfo = () => {
        this.setState({
            is_highlighted: this.isHighlighted()
        })
        this.props.node.track_promise.then(track => {
            if (track) {
                this.track_id = track.id
            }

        })
    }

    getClassName() {
        if(this.props.node.id === this.props.hovered_node_id) {
            return 'active-label'
        }
        if(this.props.node.sources && this.props.node.sources.includes(this.props.hovered_node_id)) {
            return 'child-label'
        }
        else if(this.props.node.targets && this.props.node.targets.includes(this.props.hovered_node_id)){
            return 'parent-label'
        }
    }

    isHighlighted() {
        return (this.props.node.id === this.props.hovered_node_id ||
            (this.props.node.sources && this.props.node.sources.includes(this.props.hovered_node_id)) ||
            (this.props.node.targets && this.props.node.targets.includes(this.props.hovered_node_id)))
    }

    render () {
        let class_name = this.getClassName()
        let text = this.props.getLabelText()
        return (
            <g>
                {(this.state.is_highlighted === true) &&
                    <g id={`${this.props.node.id}-label`}>
                        {React.cloneElement(text, {className: class_name})}
                        {React.cloneElement(text, {className: 'label-fill'})}
                    </g>
                }
                {(this.state.is_highlighted !== true) &&
                    <a href={`spotify:track:${this.track_id}`}>
                        {React.cloneElement(text, {className: 'hidden-label'})}
                    </a>
                }
            </g>
        )
    }
}