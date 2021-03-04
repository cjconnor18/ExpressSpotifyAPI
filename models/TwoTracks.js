const Track = require('./Track.js');

class TwoTracks {
  constructor(artist, track) {
    this.artist = artist;
    this.track1 = track;
    this.track2 = new Track('', '', '');
  }

  addTrack(track) {
    if(!this.isFull()) {
      this.track2 = track;
      return true;
    } 
    return false;
  }

  isFull() {
    if(!this.track2.name) {
      return false;
    } else {
      return true;
    }
  }
}

module.exports = TwoTracks;