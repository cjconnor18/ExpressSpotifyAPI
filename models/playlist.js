class Playlist {
  constructor(id, name, description, trackQuantity, trackListingURI) {
    this.id = id,
    this.name = name,
    this.description = description,
    this.trackQuantity = trackQuantity, 
    this.trackListingURI = trackListingURI
    this.tracks = []
  }
  addTrack(track) {
    this.tracks.push(track);
  }
  
}

module.exports = Playlist;