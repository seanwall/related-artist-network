import React from 'react';
import './App.css';
import SpotifyService from './SpotifyService.js';
import Graph from './Graph.js';

class App extends React.Component {
  state = {
      initial_artist: null,
      search_query: ''
  }

  componentDidMount() {
      SpotifyService.clientSpotifyAuth();
  }

  //Queries spotify service for artists using given search param
  searchArtists = (search_query) => {
      return SpotifyService.searchArtists(search_query).then(response => response.artists.items)
  }

  getTrackForArtist = (artist_id) => {
        return SpotifyService.getTopTracks(artist_id).then(response => response.tracks[0])
  }

  //Given a search query, retrieves artists from spotify and creates an initial node for the graph
  setInitialArtist = (search_query) => {
    if(search_query) {
        this.searchArtists(search_query).then(artist_arr => {
            this.setState({search_query: ''})
            if (artist_arr.length === 0) {
                console.log('No artists found search again')
            }
            else {
                const artist_obj = artist_arr[0]
                let track_promise = this.getTrackForArtist(artist_obj.id).then(track => track)
                this.setState({
                    initial_artist: {... artist_obj, track_promise: track_promise}
                })
            }
        })
    }
  }

  render() {
        let searchGroup =
            <form className='input-group input-group-sm'
                  onSubmit={(e) => {
                      e.preventDefault();
                      this.setInitialArtist(this.state.search_query);
                  }}>
                <input className='form-control'
                       onChange={(event) => this.setState({
                           search_query: event.target.value
                       })}
                       value={this.state.search_query}
                       placeholder="Artist name..."/>
                <button className='ml-2 mr-1 col-3'
                        type='submit'>
                    Go
                </button>
            </form>

        return(
            <div className="container-fluid h-100 p-0">
                {
                    !this.state.initial_artist &&
                    <div className="row h-100 no-gutters">
                        <div className="col-2"></div>
                        <div className="col-8">
                            <div className="home-group">
                                <p className="text-center">
                                    This is an interactive music exploration tool built using related artist data from Spotify's Web API.
                                    Enter an artist name to start a graph.
                                </p>
                                <div className="row">
                                    <div className="col-1"></div>
                                    <div className="col-10">
                                        {searchGroup}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                }
                {
                    this.state.initial_artist &&
                    <div>
                        <div className='h-25'>
                            <div className='svg-key m-1 p-2'>
                                <p className='m-0'><b>Hover</b> over a node to hear a sample</p>
                                <p className='m-0'><b>Click</b> on a node to explore</p>
                                <p className='m-0'><b>Click</b> on an artist's name to open their Spotify page</p>
                                <p className='m-0'><b>Click and drag</b> to move the graph</p>
                                {searchGroup}
                            </div>
                        </div>
                        <Graph initial_artist={this.state.initial_artist}/>
                    </div>
                }
            </div>)
  }
}

export default App;
