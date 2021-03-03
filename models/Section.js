const TwoTrack = require('TwoTracks');

class Section  {
  constructor() {
    this.twoTracks = []
  }
  addTrack(track) {
    if(this.hasFourTwoTracksFilled()) {
      return false;
    } else {
      for(let i = 0; i < this.twoTracks.length; i++) {
        if(this.twoTracks[i].isFull()) {
          continue;
        } else if(this.twoTracks[i].artist === track.artist) {
          return this.twoTracks[i].addTrack(track);
        } 
  
      }
      if(this.twoTracks.length < 4) {
        //new two track
        this.twoTracks.push(new TwoTrack(track.artist, track));
        return true;
      }
      return false;
    }
  }

  hasFourTwoTracks() {
    if(this.twoTracks.length === 4) {
      return true;
    }
    return false;
  }

  hasFourTwoTracksFilled() {
    let completed = 0;
    for(let i = 0; i < this.twoTracks.length; i++) {
      if(this.twoTracks[i].isFull()) {
        completed++;
      }
    }
    if(completed === 4) {
      return true;
    }
    return false;
  }
}

module.exports = Section;