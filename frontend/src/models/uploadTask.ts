export type UploadTask = {
    file: File;
    progress: number;
    error: string;
    status: 'queued' | 'uploading' | 'complete';
}