import React from 'react';
import * as d3 from 'd3';
import SpotifyService from "./SpotifyService";
import Node from './Node.js';
import Edge from './Edge.js';
import Label from './Label.js';
import './Graph.css'
import './Label.css'
import './Node.css'
import './Edge.css'

const width = window.innerWidth;
const height = window.innerHeight;

// Node object structure:
/*
    {
        id: String,
        sources: [String],
        targets: [String], - Optional (populated once node is explored)
        name: String,
        popularity: Number,
        x: Number,
        y: Number,
        track_promise: Promise<String>
    }
 */

// Edge object structure:
/*
    {
        id: String,
        source: String,
        target: String
    }
 */

export default class Graph extends React.Component {
    constructor(props) {
        super(props)
    }

    state = {
        hovered_node_id: null,
        dragging: false,
        view_pos: {
            x: 0,
            y: 0
        },
        /*
         Position information used for dragging logic
         drag: {
            rel_pos: {
                x: Number,
                y: Number
            }
            init_pos: {
                x: Number,
                y: Number
            }
         }
         */
        drag: null
    }

    // Storing nodes and edges outside of state as we'll be managing rendering manually
    // as D3 force simulation ticks (doesnt play nice with react trying to control rendering
    // when state changes)
    nodes = [];
    edges = [];

    force = null;

    componentDidMount() {
        this.initializeNewGraph()
    }

    componentDidUpdate(prevProps) {
        if(this.props.initial_artist !== prevProps.initial_artist){
            this.initializeNewGraph()
        }
    }

    //Creates initial node from prop passed from App.js,
    initializeNewGraph = () => {
        // Center visualization when initialized
        this.setState({
            view_pos: {
                x: 0,
                y: 0
            }
        })

        const initial_node = {
            id: this.props.initial_artist.id,
            sources: [],
            name: this.props.initial_artist.name,
            popularity: this.props.initial_artist.popularity,
            x: 0,
            y: 0,
            track_promise: this.props.initial_artist.track_promise
        }
        //Initializing nodes & edges - or resetting them if new Graph is being created
        this.nodes = [initial_node]
        this.edges = []

        this.expandGraph(initial_node).then(response => {
            // Don't start force simulation until graph is populated from spotify query
            this.startD3Simulation()
        })
    }

    getRelatedArtists = (artist_id) => {
        return SpotifyService.getRelatedArtists(artist_id).then(response => response.artists)
    }

    getTrackForArtist = (artist_id) => {
        return SpotifyService.getTopTracks(artist_id).then(response => response.tracks[0])
    }

    // Initializes D3 force simulation and sets 'tick' and 'end' triggers
    startD3Simulation() {
        this.force = d3.forceSimulation(this.nodes)
            .force("charge", d3.forceManyBody().strength(-1000))
            .force("link", d3.forceLink(this.edges).id(n => n.id).distance(90))
            .force("collide", d3.forceCollide([25]).iterations([5]))
            .force("center", d3.forceCenter().x(width / 2).y(height / 2))

        // Forcing re-render on each tick of the force simulation
        this.force.on('tick', () => {
            this.forceUpdate()
        });
    }

    // Expands the graph with given node's related artists and triggers the force simulation
    expandNode(node) {
        // Fix nodes and remove centering force once a new node is expanded
        this.nodes.map((n) => {
            if(n.id != node.id) {
                n.fx = n.x
                n.fy = n.y
            }
            else {
                n.fx = null
                n.fy = null
            }
        })
        this.force.force("center", null)

        this.expandGraph(node).then(response => {
            // Update force simulation with new set of nodes & edges and restart simulation
            this.force.nodes(this.nodes)
            this.force.force("link").links(this.edges)
            this.force.alpha(1).restart();
        })
    }

    // Given an artist node, retrieves related artists for that artist, adds new nodes and edges to the graph as needed
    expandGraph = (expanded_node) => {
        return this.getRelatedArtists(expanded_node.id).then((related_artists) => {
            let new_nodes = []
            let new_edges = []
            // Keeping track of artists related to expanded node to pass to expanded node object - used
            // to know which nodes to highlight when a node is hovered
            let targets = []

            related_artists.forEach(artist => {
                const new_node_id = artist.id;
                targets.push(new_node_id)

                // Check for node dupes
                this.nodes.filter((existing_node) => existing_node.id === artist.id)
                          .map((existing_node) => existing_node.sources.push(expanded_node.id))
                if(!this.nodes.some((existing_node) => existing_node.id === artist.id)) {
                    // Want spotify get track calls to happen asynchronously, so nodes can be
                    // animated without waiting for all calls - give nodes the getTrack spotify call promise
                    // so that track url for preview can be resolved later
                    let track_promise = this.getTrackForArtist(artist.id).then(track => track)
                    let artist_node = {
                        id:artist.id,
                        sources: [expanded_node.id],
                        name:artist.name,
                        popularity:artist.popularity,
                        x: 0,
                        y:0,
                        track_promise: track_promise
                    }
                    new_nodes.push(artist_node)
                }
                const new_edge_id = `e${expanded_node.id}-${new_node_id}`
                // Check for edge dupes
                if(!this.edges.some((existing_edge) => existing_edge.id === new_edge_id)) {
                    new_edges.push({id:new_edge_id, source:expanded_node.id ,target:new_node_id})
                }
            })

            expanded_node.targets = targets

            this.nodes = this.nodes.concat(new_nodes)
            this.edges = this.edges.concat(new_edges)
        })
    }

    setHoveredNode = (node_id) => {
        this.setState({
            hovered_node_id: node_id
        })
    }

    startDrag = (e) => {
        // Starting a drag only on left mouse button click
        if (e.button === 0) {
            let x_curr = window.pageXOffset;
            let y_curr = window.pageYOffset;
            this.setState({
                dragging: true,
                drag: {
                    rel_pos: {
                        x: e.screenX - x_curr,
                        y: e.screenY - y_curr
                    },
                    init_pos: {
                        x: this.state.view_pos.x,
                        y: this.state.view_pos.y
                    }
                }
            })
            e.stopPropagation()
            e.preventDefault()
        }
    }

    stopDrag = (e) => {
        this.setState({dragging: false})
        e.stopPropagation()
        e.preventDefault()
    }

    drag = (e) => {
        if (this.state.dragging) {
            this.setState({
                view_pos: {
                    x: this.state.drag.init_pos.x + (this.state.drag.rel_pos.x - e.screenX),
                    y: this.state.drag.init_pos.y + (this.state.drag.rel_pos.y - e.screenY)
                }
            })
            e.stopPropagation()
            e.preventDefault()
        }
    }

    // Rendering calculations for nodes used for base nodes in Graph render and in Node component rendering
    getRadius = (popularity) => (popularity/5 + 2)
    getLabelText = (node) => <text className="label" textAnchor={"middle"} y={node.y + this.getRadius(node.popularity) + 7} x={node.x} dy='.5em'>{node.name}</text>
    getNodeTransform = (node) => 'translate(' + node.x + ',' + node.y + ')'

    render() {
        // Manually forcing react to render whenever D3 force sim ticks, so we recreate nodes/edges
        // on each re-render with the node/edge data being modified by D3 force sim.

        // SVG uses 'painter' pattern for deciding element z-index priority - since priority changes
        // dynamically on hovering, I found easiest & cleanest solution was to draw base circles and
        // labels then redraw on top of those to highlight when necessary.
        let edge_bed = this.edges.map((edge) => {
            return (<line className='edge' key={edge.id}
                          x1={edge.source.x} x2={edge.target.x} y1={edge.source.y} y2={edge.target.y} />)
        })
        let node_bed = this.nodes.map((node) =>
                    <circle className={'node'}
                            r={this.getRadius(node.popularity)}
                            transform={this.getNodeTransform(node)}></circle>);

        let label_bed = this.nodes.map((node) => this.getLabelText(node));

        let edges = this.edges.map((edge) => {
            return (
                <Edge edge={edge} hovered_node_id={this.state.hovered_node_id}/>
            );
        });

        let nodes = this.nodes.map((node) =>
            <Node node={node} hovered_node_id={this.state.hovered_node_id}
                  expand={() => this.expandNode(node)} setHovered={this.setHoveredNode}
                  getRadius={() => this.getRadius(node.popularity)}
                  getNodeTransform={() => this.getNodeTransform(node)}
                  view_pos={this.state.view_pos}/>
        );

        let labels = this.nodes.map((node) =>
            <Label node={node} hovered_node_id={this.state.hovered_node_id}
                   getLabelText={() => this.getLabelText(node)}/>
        )

        let foreground_labels = []
        if (this.state.hovered_node_id) {
            foreground_labels = this.nodes.map((node) => {
                if(this.state.hovered_node_id === node.id ||
                   node.sources.includes(this.state.hovered_node_id) ||
                   (node.targets && node.targets.includes(this.state.hovered_node_id))) {
                return <Label node={node} hovered_node_id={this.state.hovered_node_id}
                           getLabelText={() => this.getLabelText(node)}/>
                }
            })
        }

        return (
            <svg className='graph'
                 width={width}
                 height={height}
                 viewBox={`${this.state.view_pos.x} ${this.state.view_pos.y} ${width} ${height}`}
                 overflow={"auto"}
                 onMouseDown={(e) => this.startDrag(e)}
                 onMouseMove={(e) => this.drag(e)}
                 onMouseUp={(e) => this.stopDrag(e)}>
                <g>
                    <g id={"base_edges"}>
                        {edge_bed}
                    </g>
                    <g id={"base_nodes"}>
                        {node_bed}
                    </g>
                    <g id={"base_labels"}>
                        {label_bed}
                    </g>
                    <g id={"edges"}>
                        {edges}
                    </g>
                    <g id={"labels"}>
                        {labels}
                    </g>
                    <g id={"nodes"}>
                        {nodes}
                    </g>
                    {foreground_labels}
                    {this.state.hovered_node_id &&
                    <g>
                        <use xlinkHref={`#${this.state.hovered_node_id}-label`}></use>
                        <use xlinkHref={`#${this.state.hovered_node_id}-preview`}></use>
                    </g>
                    }
                </g>
            </svg>
        );

    }
}