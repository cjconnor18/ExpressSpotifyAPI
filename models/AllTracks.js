  
const Page = require("./Page.js");

class AllTracks  {
  constructor() {
    this.pages = []
  }
  addTrack(track) {
    if(this.pages.length >= 1) {
      for(let i = 0; i < this.pages.length; i++) {
        if(this.pages[i].hasFourSectionsFilled()) {
          continue;
        } else {
          if(this.pages[i].addTrack(track)) {
            return true;
          } 
        }
        if(i == this.pages.length - 1) {
          this.pages.push(new Page());
          this.pages[this.pages.length -1].addTrack(track);
          return true;
        }
      }
    } else {
      this.pages.push(new Page());
      this.pages[0].addTrack(track);
    }
  }


}
//find a specific track this.pages[pageNumber].sections[sectionNumber].twoTracks[selectNum] and then add track1 or track2 remember. 
module.exports = AllTracks;