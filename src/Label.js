import React from 'react';
import './Label.css'

export default class Label extends React.Component {
    constructor(props) {
        super(props)
    }

    getClassName() {
        if(this.props.node.id === this.props.hovered_node) {
            return 'active-label'
        }
        if(this.props.node.sources && this.props.node.sources.includes(this.props.hovered_node)) {
            return 'child-label'
        }
        else if(this.props.node.targets && this.props.node.targets.includes(this.props.hovered_node)){
            return 'parent-label'
        }
    }

    render () {
        let class_name = this.getClassName()
        console.log(class_name)
        let text = this.props.getLabelText()
        return (
            <g id={`${this.props.node.id}-label`}>
                {React.cloneElement(text, {className: class_name})}
                {React.cloneElement(text, {className: 'label-underlay'})}
            </g>
        )}
}