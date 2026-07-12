class Sighting {
    constructor(data) {
        this.id = data.id || null;
        this.userId = data.userId;
        this.speciesId = data.speciesId;
        this.latitude = data.latitude;
        this.longitude = data.longitude;
        this.locationName = data.locationName;
        this.description = data.description || '';
        this.imageUrl = data.imageUrl || null;
        this.sightedAt = data.sightedAt || new Date();
        this.status = data.status || 'pending'; // 'pending' | 'approved' | 'rejected'
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }

    toJSON() {
        return {
            id: this.id,
            userId: this.userId,
            speciesId: this.speciesId,
            latitude: this.latitude,
            longitude: this.longitude,
            locationName: this.locationName,
            description: this.description,
            imageUrl: this.imageUrl,
            sightedAt: this.sightedAt,
            status: this.status
        };
    }
}

module.exports = Sighting;
