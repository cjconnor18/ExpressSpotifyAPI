const express = require('express');
const loginRoutes = require('../controllers/loginController');

const querystring = require('querystring');
const cookieParser = require('cookie-parser');

const router = express.Router();

router.use(cookieParser());

router.get('/', loginRoutes.login_index);
router.get('/login', loginRoutes.login_login);
router.get('/callback', loginRoutes.login_user);
router.get('/refresh_token', loginRoutes.login_refreshToken);
router.get('/playlists', loginRoutes.login_playlists_get);
router.get('/player/:playlistId', loginRoutes.login_player);
router.get('/play', loginRoutes.login_play);

module.exports = router;