import React from 'react';
import * as d3 from 'd3';
import SpotifyService from "./SpotifyService";

const width = 960;
const height = 500;

export default class Graph extends React.Component {
    constructor(props) {
        super(props)
    }

    //Storing nodes and edges outside of state as we'll be managing rendering manually
    //on D3 force simulation ticks (doesnt play nice with react trying to control rendering
    //on state changes)
    nodes = [];
    edges = [];

    componentDidMount() {
        const initial_node = {
            id: this.props.initial_artist.id,
            name: this.props.initial_artist.name,
            popularity: this.props.initial_artist.popularity,
            x: 0,
            y: 0
        }
        this.nodes = [initial_node]

        this.expandGraph(initial_node).then(response => {
            //Don't start force simulation until graph is populated from spotify query
            this.startD3Simulation()
        })
    }

    startD3Simulation() {
        let force = d3.forceSimulation(this.nodes)
            .force("charge", d3.forceManyBody().strength(-50))
            .force("link", d3.forceLink(this.edges).id(n => n.id).distance(90))
            .force("center", d3.forceCenter().x(width / 2).y(height / 2))
            .force("collide", d3.forceCollide([5]).iterations([5]));
        //TODO DOES FORCE 'STOP' ONCE NODES ARE SETTLED?
        force.on('tick', () => {
            //Forcing update on each tick as long as nodes are being positioned by force simulation
            this.forceUpdate()
        });
    }

    expandNode(node) {
        this.expandGraph(node).then(response => {
            //Don't start force simulation until graph is updated from spotify query
            this.startD3Simulation()
        })
    }

    getRelatedArtists = (artist_id) => {
        return SpotifyService.getRelatedArtists(artist_id).then(response => response.artists)
    }

    //Given an artist node, retrieves related artists for that artist, adds new nodes and edges to the graph as needed
    expandGraph = (expanded_node) => {
        return this.getRelatedArtists(expanded_node.id).then(related_artists => {
            let new_nodes = []
            let new_edges = []

            related_artists.forEach(artist => {
                const new_node_id = artist.id;
                //Check for node dupes
                if(!this.nodes.some((existing_node) => existing_node.id === artist.id)) {
                    new_nodes.push({id:artist.id, name:artist.name, popularity:artist.popularity, x: 0, y:0});
                }
                const new_edge_id = `e${expanded_node.id}-${new_node_id}`
                //Check for edge dupes
                if(!this.edges.some((existing_edge) => existing_edge.id === new_edge_id)) {
                    new_edges.push({id:new_edge_id, source:expanded_node.id ,target:new_node_id})
                }
            })

            const nodes = this.nodes.concat(new_nodes)
            const edges = this.edges.concat(new_edges)

            this.nodes = nodes;
            this.edges = edges;
        })
    }

    render() {
        let nodes = this.nodes.map((node) => {
            const transform = 'translate(' + node.x + ',' + node.y + ')';
            return (
                <g className='node' key={node.id} transform={transform}>
                    <circle r={5} onClick={() => this.expandNode(node)}/>
                    <text x={5 + 5} dy='.35em'>{node.name}</text>
                </g>
            );
        });
        let links = this.edges.map((edge) => {
            return (
                <line className='link' key={edge.id} stroke={'black'} strokeWidth={.5}
                      x1={edge.source.x} x2={edge.target.x} y1={edge.source.y} y2={edge.target.y} />
            );
        });
        return (
            <svg className='graph' width={width} height={height}>
                <g>
                    {links}
                    {nodes}
                </g>
            </svg>
        );

    }
}