

export function agpaPhotoToGalleryPhoto(photo) {
    return {
        url: `/files/agpa/${photo.year}/mini/${photo.filename}`,
        thumb: `/files/agpa/${photo.year}/mini/vignette_${photo.filename}`,
        title: photo.title,
        username: photo.user.username,
        rank: photo.ranking,
    };
}
