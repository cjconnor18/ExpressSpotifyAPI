const request  = require('request');
const querystring = require('querystring');
const secrets = require('../secrets');
const Playlist = require('../models/playlist');
const Track = require('../models/track');
const generateRandomString = require('../miscFunctions').generateRandomString;
const { get } = require('request');


const client_id = secrets.clientID;
const client_secret = secrets.clientSecret;
const redirect_uri = "http://localhost:3000/login/callback";
let stateKey = 'spotify_auth_state';
let listsOfPlaylists = new Map();

let access_token = "";
let refresh_token = "";

const login_index = (req, res) => {
  res.render('./login/index', { secrets });
}

const login_login = (req, res) => {
  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  var scope = 'user-read-private user-read-email';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
  }));
};

const login_user = (req, res) => {
  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };
    
    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        access_token = body.access_token;
        refresh_token = body.refresh_token;

        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };
         
        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
          // console.log(body);
          let limit = 50;
          let offset = 0;
          let optionsPlaylist = {
            url: 'https://api.spotify.com/v1/me/playlists?offset=' + offset.toString() + '&limit=' + limit.toString(),
            headers: { 'Authorization': 'Bearer ' + access_token },
            json: true
          }

          // gets the first 50 playlists (number is set according to limit )
          request.get(optionsPlaylist, (error, response, body) => {
            body.items.forEach(playlist => {
              listsOfPlaylists.set(playlist.id, new Playlist(playlist.id, playlist.name, playlist.description, playlist.tracks.total, playlist.tracks.href));
            });
              
            //next playlist using the next url specified in the body
            if (body.next !== null) {
              request.get({
                url: body.next,
                headers: { 'Authorization': 'Bearer ' + access_token },
                json: true
              }, (error, response, body) => {
                body.items.forEach(playlist => {
                  listsOfPlaylists.set(playlist.id, new Playlist(playlist.id, playlist.name, playlist.description, playlist.tracks.total, playlist.tracks.href));
                });
                res.redirect('/login/playlists/#' +
                  querystring.stringify({
                  access_token: access_token,
                  refresh_token: refresh_token
                }));
              })
            } else {
              res.redirect('/login/playlists/#' +
              querystring.stringify({
                access_token: access_token,
                refresh_token: refresh_token
              }));
            }
          })
        }) 
        // moved this up into callback functions because otherwise it fired before loading the playlists.
        // res.redirect('/login/playlists/#' +
        //   querystring.stringify({
        //     access_token: access_token,
        //     refresh_token: refresh_token
        // }));  
    
      } else {
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
        }));
      }
    });
  } 
};

const login_playlists_get = (req, res) => {
  res.render('./login/playlists', { playlists : listsOfPlaylists });
}

// will display a spotify player with tracks
const login_player = (req, res) => {
  const id = req.params.playlistId;
  let currentPlaylist = listsOfPlaylists.get(id);
    
  let optionsTrackList = {
    url: 'https://api.spotify.com/v1/playlists/' + id + '/tracks',
    headers: { 'Authorization': 'Bearer ' + access_token },
    json: true
  }
  request.get(optionsTrackList, (error, response, body) => {
    
    
    for(let i = 0; i < body.items.length; i++) {
      console.log(body.items[i].track.name,body.items[i].track.artists[0].name, body.items[i].track.uri);
      let newTrack = new Track(body.items[i].track.name, body.items[i].track.artists[0].name, body.items[i].track.uri);
      currentPlaylist.addTrack(newTrack);
      
      console.log(currentPlaylist.tracks.length);
    }
      
    
    // body.items.forEach( track => {
    //   console.log(track.name)
    //   track.artists.forEach( artist => {
    //     console.log(artist);
    //   })
    // })
    console.log(body.items[0]);
    console.log(' ');
    console.log('-----------------------------------------');
    console.log(' ');
    console.log(body.items[0].track.name);
    console.log(body.items[0].track.artists[0].name);
    console.log(body.items[0].track.duration_ms);
    res.render('./login/player', { refresh_token, access_token, currentPlaylist });
  })
  //moved into request.get so it would only render after completing list.
  // res.render('./login/player', { refresh_token, access_token, currentPlaylist });
};




const login_refreshToken = (req, res) => {
  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      access_token = body.access_token;
      
      res.send({
        'access_token': access_token,
        'refresh_token': refresh_token
      });
    }
  });
};


module.exports = {
  login_index,
  login_login,
  login_user,
  login_playlists_get,
  login_refreshToken, 
  login_player
};