import React from 'react';
import logo from './logo.svg';
import './App.css';
import SpotifyService from './SpotifyService.js';
import Graph from './Graph.js';
import {Sigma, RelativeSize, RandomizeNodePositions} from 'react-sigma';

class App extends React.Component {
  state = {
      initial_artist: null,
      searchQuery: ''
  }

  componentDidMount() {
      SpotifyService.clientSpotifyAuth();
  }

  //Queries spotify service for artists using given search param
  searchArtists = (search_query) => {
      return SpotifyService.searchArtists(search_query).then(response => response.artists.items)
  }

  //Given a search query, retrieves artists from spotify and creates an initial node for the graph
  setInitialArtist = (search_query) => {
    if(!search_query) {
        //TODO ERROR ALERT
        console.log('null or empty search query')
    }
    else{
        this.searchArtists(search_query).then(artist_arr => {
            if (artist_arr.length === 0) {
                //TODO ERROR ALERT
                console.log('No artists found search again')
            }
            else {
                //TODO CURRENTLY TAKING FIRST ARTIST, GIVE OPTIONS?
                const artist_obj = artist_arr[0]
                this.setState({
                    initial_artist: artist_obj
                })
            }
        })
    }
  }

  render() {
        return(
            <div className="wrapper">
                {
                    !this.state.initial_artist &&
                    <div>
                        <h1>

                        </h1>
                        <input onChange={(event) => this.setState({
                            searchQuery: event.target.value
                        })}
                               value={this.state.searchQuery}
                               placeholder="Enter an artist to start your graph"/>
                        <button
                            onClick={
                                () => {
                                    this.setInitialArtist(this.state.searchQuery);
                                }}>
                            Explore
                        </button>
                    </div>
                }
                {
                    this.state.initial_artist &&
                    <Graph initial_artist={this.state.initial_artist}/>
                }
            </div>)
  }
}

export default App;
