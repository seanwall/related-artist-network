import React from 'react';
import * as d3 from 'd3';
import SpotifyService from "./SpotifyService";
import Node from './Node.js';
import './Graph.css'

const width = 2000;
const height = 2000;

//Node object structure:
/*
    {
        id: String,
        name: String,
        popularity: Number,
        x: Number,
        y: Number,
        preview_url_promise: Promise<String>
    }
 */

//Edge object structure:
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

    //Storing nodes and edges outside of state as we'll be managing rendering manually
    //as D3 force simulation ticks (doesnt play nice with react trying to control rendering
    //when state changes)
    nodes = [];
    edges = [];

    force = null;

    firstSim = true;

    componentDidMount() {
        //Center visualization when initialized, accounting for window size
        window.scrollTo(width/2 - (window.innerWidth/2), height/2 - (window.innerHeight/2))

        const initial_node = {
            id: this.props.initial_artist.id,
            name: this.props.initial_artist.name,
            popularity: this.props.initial_artist.popularity,
            x: 0,
            y: 0,
            track_promise: this.props.initial_artist.track_promise
        }
        this.nodes = [initial_node]

        this.expandGraph(initial_node).then(response => {
            //Don't start force simulation until graph is populated from spotify query
            this.startD3Simulation()
        })
    }

    //Initializes D3 force simulation and sets 'tick' and 'end' triggers
    startD3Simulation() {
        this.force = d3.forceSimulation(this.nodes)
            .force("charge", d3.forceManyBody().strength(-1000))
            .force("link", d3.forceLink(this.edges).id(n => n.id).distance(90))
            .force("collide", d3.forceCollide([25]).iterations([5]))
            .force("center", d3.forceCenter().x(width / 2).y(height / 2))

        //Forcing re-render on each tick of the force simulation
        this.force.on('tick', () => {
            this.forceUpdate()
        });

        // this.force.on('end', () => {
        //     //Fix nodes once simulation ends
        //     this.nodes = this.nodes.map((node) => {
        //         return {
        //             ...node,
        //             'fx': node.x,
        //             'fy': node.y
        //         }
        //     })
        //     //Remove centering force once simulation ends (only really matters for first simulation)
        //     this.force.force("center", null)
        //     console.log(this.nodes)
        // })
    }

    //Expands the graph with given node's related artists and triggers the force simulation
    expandNode(node) {
        // if(this.firstSim) {
        //     this.firstSim = false
            //Fix nodes and remove centering force once a new node is expanded
            this.nodes = this.nodes.map((node) => {
                return {
                    ...node,
                    'fx': node.x,
                    'fy': node.y
                }
            })
            this.force.force("center", null)
        //}
        this.expandGraph(node).then(response => {
            //Update force simulation with new set of nodes & edges and restart simulation
            this.force.nodes(this.nodes)
            this.force.force("link").links(this.edges)
            this.force.alpha(1).restart();
        })
    }

    getRelatedArtists = (artist_id) => {
        return SpotifyService.getRelatedArtists(artist_id).then(response => response.artists)
    }

    getTrackForArtist = (artist_id) => {
        return SpotifyService.getTopTracks(artist_id).then(response => response.tracks[0])
    }

    //Given an artist node, retrieves related artists for that artist, adds new nodes and edges to the graph as needed
    expandGraph = (expanded_node) => {
        return this.getRelatedArtists(expanded_node.id).then((related_artists) => {
            let new_nodes = []
            let new_edges = []

            related_artists.forEach(artist => {
                const new_node_id = artist.id;
                //Check for node dupes
                if(!this.nodes.some((existing_node) => existing_node.id === artist.id)) {
                    //Want spotify get track calls to happen asynchronously, so that nodes can be
                    //animated without waiting for all calls - give nodes the preview url promise
                    //so that preview url can be resolved later
                    let track_promise = this.getTrackForArtist(artist.id).then(track => track)
                    let artist_node = {
                        id:artist.id,
                        name:artist.name,
                        popularity:artist.popularity,
                        x: 0,
                        y:0,
                        track_promise: track_promise
                    }
                    new_nodes.push(artist_node)
                    //Start getTrack spotify call asynchronously, will mutate node when promise resolves
                }
                const new_edge_id = `e${expanded_node.id}-${new_node_id}`
                //Check for edge dupes
                if(!this.edges.some((existing_edge) => existing_edge.id === new_edge_id)) {
                    new_edges.push({id:new_edge_id, source:expanded_node.id ,target:new_node_id})
                }
            })

            this.nodes = this.nodes.concat(new_nodes)
            this.edges = this.edges.concat(new_edges)
        })
    }

    render() {
        //Manually forcing react to render whenever force sim ticks, so we manually position nodes/edges
        //here on each re-render
        let nodes = this.nodes.map((node) =>
                <Node node={node} expand={() => this.expandNode(node)}/>
            );
        let links = this.edges.map((edge) => {
            return (
                <line className='link' key={edge.id} stroke={'black'} strokeWidth={.5}
                      x1={edge.source.x} x2={edge.target.x} y1={edge.source.y} y2={edge.target.y} />
            );
        });

        return (
            <svg className='graph' width={width} height={height} overflow={"auto"}>
                <g>
                    {links}
                    {nodes}
                </g>
            </svg>
        );

    }
}