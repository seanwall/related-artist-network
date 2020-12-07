import React from 'react';
import './Edge.css';

export default class Edge extends React.Component {
    constructor(props){
        super(props)
    }

    // state = {
    //     mouseOver: false
    // }

    getClassName() {
        if(this.props.hovered_node === this.props.edge.source.id) {
            return 'edge-child'
        }
        else if(this.props.hovered_node === this.props.edge.target.id){
            return 'edge-parent'
        }
        else {
            return 'edge'
        }
    }

    render() {
        let className = this.getClassName()

        return <line className={className} key={this.props.edge.id}
                     x1={this.props.edge.source.x} x2={this.props.edge.target.x} y1={this.props.edge.source.y} y2={this.props.edge.target.y} />
    }
}