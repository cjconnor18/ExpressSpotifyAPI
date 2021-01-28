const request  = require('request');
const querystring = require('querystring');
const secrets = require('../secrets');
const Playlist = require('../models/playlist');
const generateRandomString = require('../miscFunctions').generateRandomString;


const client_id = secrets.clientID;
const client_secret = secrets.clientSecret;
const redirect_uri = "http://localhost:3000/login/callback";
let stateKey = 'spotify_auth_state';
let listOfPlaylists = [];

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

        var access_token = body.access_token,
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

          request.get(optionsPlaylist, (error, response, body) => {

            //console.log(body);
            body.items.forEach(playlist => {
              listOfPlaylists.push(new Playlist(playlist.id, playlist.name, playlist.description, playlist.tracks.total, playlist.tracks.href));
            });
              
            


            if(body.total > limit + offset) {
              request.get({
                url: body.next,
                headers: { 'Authorization': 'Bearer ' + access_token },
                json: true
              }, (error, response, body) => {

                //console.log(body);
                
              })
            }


          })



        });
        
        res.redirect('/login/playlists/#' +
          querystring.stringify({
            access_token: access_token,
            refresh_token: refresh_token
          }));
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
  console.log(listOfPlaylists);
  res.render('./login/playlists', { playlists : listOfPlaylists });
}

const login_player = (req, res) => {
  res.render('./login/player')
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
      var access_token = body.access_token;
      res.send({
        'access_token': access_token
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