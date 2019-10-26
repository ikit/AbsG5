

export function agpaPhotoToGalleryPhoto(photo) {
    return {
        url: `http://absolumentg.fr/assets/img/agpa/${photo.year}/mini/${photo.filename}`,
        thumb: `http://absolumentg.fr/assets/img/agpa/${photo.year}/mini/vignette_${photo.filename}`,
        title: photo.title,
        username: photo.user.username,
        rank: photo.ranking,
    };
}
