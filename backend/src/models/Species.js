class Species {
    constructor(data) {
        this.id = data.id || null;
        this.commonName = data.commonName;
        this.scientificName = data.scientificName;
        this.family = data.family || '';
        this.description = data.description || '';
        this.habitat = data.habitat || '';
        this.conservationStatus = data.conservationStatus || '';
        this.imageUrl = data.imageUrl || null;
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }
}

module.exports = Species;
