export type File = {
    created_at: string;
    date_taken: string;
    file_type: 'photo'|'video';
    filename_original: string;
    hash: string;
    height: number;
    width: number;
    uuid: string;
    id: number;
    mimetype: string;
}