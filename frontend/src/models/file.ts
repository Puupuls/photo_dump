export type File = {
    created_at: string;
    file_type: 'photo'|'video';
    filename_original: string;
    hash: string;
    uuid: string;
    id: number;
    mimetype: string;
    src: string;
    file_extension: string;

    meta_dict: {
        [key: string]: string | number | boolean;
    };
}