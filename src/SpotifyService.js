var accessToken = ''

const clientSpotifyAuth = () =>
    fetch("https://young-garden-14101.herokuapp.com/spotify/auth")
        .then(response => response.json())
        .then(token => accessToken = token)

const searchArtists = (query) =>
    fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query.trim())}&type=artist`, {
        headers: {
            'Authorization': 'Bearer ' + accessToken
        }
    }).then(response => response.json())

const getRelatedArtists = (artist_id) =>
    fetch(`https://api.spotify.com/v1/artists/${artist_id}/related-artists`, {
        headers: {
            'Authorization': 'Bearer ' + accessToken
        }
    }).then(response => response.json())

const getTopTracks = (artist_id) =>
    fetch(`https://api.spotify.com/v1/artists/${artist_id}/top-tracks?country=US`, {
        headers: {
            'Authorization': 'Bearer ' + accessToken
        }
    }).then(response => response.json())

export default {
    clientSpotifyAuth,
    searchArtists,
    getRelatedArtists,
    getTopTracks
}