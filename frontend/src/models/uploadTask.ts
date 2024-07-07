export type UploadTask = {
    file: File;
    progress: number;
    error: string | object;
    status: 'queued' | 'uploading' | 'complete';
    albumUuid?: string;
}