export type FileType = {
    created_at: string;
    file_type: 'photo'|'video';
    filename_original: string;
    hash: string;
    uuid: string;
    id: number;
    mimetype: string;
    src: string;
    file_extension: string;

    creator_id: number;
    uploader_id: number;

    meta_dict: {
        [key: string]: string | number | boolean;
    };
}