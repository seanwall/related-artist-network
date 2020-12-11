import React from 'react';
import './Edge.css';

export default class Edge extends React.Component {
    constructor(props){
        super(props)
    }

    getClassName() {
        if(this.props.hovered_node_id === this.props.edge.source.id) {
            return 'child-edge'
        }
        else if(this.props.hovered_node_id === this.props.edge.target.id){
            return 'parent-edge'
        }
        else {
            return 'edge'
        }
    }

    render() {
        let class_name = this.getClassName()

        return <line className={class_name} key={this.props.edge.id}
                     x1={this.props.edge.source.x} x2={this.props.edge.target.x} y1={this.props.edge.source.y} y2={this.props.edge.target.y} />
    }
}