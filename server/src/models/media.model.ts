import { validateMedia } from "../_db/validators";
import { putItem, getItem } from "../_db/helpers";
import { TABLES, Media } from "../_db/schemas";

export const createMedia = async (media: Media) => {
    if (!validateMedia(media)) {
        throw new Error(
            `Invalid media data: ${JSON.stringify(validateMedia.errors)}`
        );
    }
    return await putItem(TABLES.MEDIA, media);
};

export const getMediaById = async (mediaId: string) => {
    return await getItem(TABLES.MEDIA, { mediaId });
};

export const updateMedia = async (media: Media) => {
    if (!validateMedia(media)) {
        throw new Error(
            `Invalid media data: ${JSON.stringify(validateMedia.errors)}`
        );
    }
    return await putItem(TABLES.MEDIA, media);
};
