import React from 'react';
import './App.css';
import SpotifyService from './SpotifyService.js';
import Graph from './Graph.js';

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
            <div className="container-fluid h-100">
                {
                    !this.state.initial_artist &&
                    <div className="row h-100">
                        <div className="col-2"></div>
                        <div className="col-8">
                            <div className="home-group">
                                <p className="text-center">
                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque turpis dui, pellentesque nec dapibus eu, semper ut purus. Pellentesque tristique mattis ultricies.
                                </p>
                                <div className="row">
                                    <div className="col-1"></div>
                                    <input className="col-8 mr-1"
                                        onChange={(event) => this.setState({
                                        searchQuery: event.target.value
                                    })}
                                           value={this.state.searchQuery}
                                           placeholder="Artist name..."/>
                                    <button className="col-2"
                                        onClick={
                                            () => {
                                                this.setInitialArtist(this.state.searchQuery);
                                            }}>
                                        Go
                                    </button>
                                </div>
                            </div>
                        </div>
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
