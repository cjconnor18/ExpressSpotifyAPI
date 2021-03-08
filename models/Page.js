const Section = require('./Section.js');

class Page  {
  constructor() {
    this.sections = [];
  }

  addTrack(track) {
    if(this.hasFourSectionsFilled()) {
      return false;
    } else {

      for(let i = 0; i < this.sections.length; i++) {
        if(this.sections[i].addTrack(track)) {
          return true;
        } 
      }
      if(this.hasFourSections()) {
        return false;
      } else {
        this.sections.push(new Section());
        this.sections[this.sections.length - 1].addTrack(track);
        return true;
      }
    }
  }

  hasFourSections() {
    if(this.sections.length === 4) {
      return true;
    }
    return false;
  }

  hasFourSectionsFilled() {
    let completed = 0;
    for(let i = 0; i < this.sections.length; i++) {
      if(this.sections[i].hasFourTwoTracksFilled()) {
        completed++;
      }
    }
    if(completed === 4) {
      return true;
    }
    return false;
  }
}

module.exports = Page;