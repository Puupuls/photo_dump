import {UploadTask} from "../models/uploadTask";
import {api} from "./API";
import React from "react";

const { EventEmitter } = require("events");

const MAX_CONCURRENT_UPLOADS = 2;

export const useUploadStatus = () => {
    const [uploadTasks, setUploadTasks] = React.useState<UploadTask[]>([]);
    const onEvent = () => {
        // console.log('uploadUpdate', Upload.instance.upload_tasks)
        setUploadTasks([...Upload.instance.upload_tasks]);
    }
    React.useEffect(() => {
        Upload.eventEmitter.on('uploadUpdate', onEvent);

        return () => {
            Upload.eventEmitter.off('uploadUpdate', onEvent);
        }
    }, []);

    return {uploadTasks, setUploadTasks};
}

export const useIsAllUploadsComplete = () => {
    const {uploadTasks} = useUploadStatus();
    return uploadTasks.filter((task) => task.status === 'uploading').length === 0;
}

export class Upload {
    static eventEmitter = new EventEmitter();
    static _instance: Upload;
    upload_tasks: any[] = [];
    private loop: any;

    static get instance() {
        if (!this._instance) {
            this._instance = new Upload();
        }
        return this._instance;
    }

    startLoop(){
        if (this.loop) {
            return;
        }
        this.loop = setInterval(() => {
            let numInProgress = 0;
            this.upload_tasks.forEach((task: any) => {
                if (task.status === 'uploading') {
                    numInProgress++;
                }
            });
            if (numInProgress >= MAX_CONCURRENT_UPLOADS) {
                return;
            }
            const nextTask = this.upload_tasks.find((task: any) => task.status === 'queued');
            if (!nextTask) {
                return;
            }
            nextTask.status = 'uploading';
            const formData = new FormData();
            formData.append('file', nextTask.file);
            formData.append('modified_timestamp', nextTask.file.lastModified.toString());

            let url = nextTask.albumUuid? '/files/?album_uuid=' + nextTask.albumUuid : '/files/';
            api.post(url, formData, {
                onUploadProgress: (progressEvent) => {
                    nextTask.progress = Math.round((progressEvent.loaded * 100) / (progressEvent.total??1));
                    Upload.eventEmitter.emit('uploadUpdate');
                },
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            }).then(() => {
                Upload.eventEmitter.emit('uploadUpdate');
                nextTask.status = 'complete';
            }).catch((error) => {
                nextTask.status = 'complete';
                if(error.response && error.response.data && error.response.data.detail)
                    nextTask.error = error.response.data.detail;
                else
                    nextTask.error = 'Failed to upload';
                Upload.eventEmitter.emit('uploadUpdate');
            });
            Upload.eventEmitter.emit('uploadUpdate');
        }, 1000);
    }

    selectAndUpload(albumUuid: string|undefined=undefined) {
        // Open file selector, allow selecting images and videos
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*,video/*';
        input.multiple = true;
        input.onchange = (e) => {
            const files = (e.target as HTMLInputElement).files;
            if (files) {
                this.uploadFiles(Array.from(files), albumUuid);
            }
        }
        input.click();
    }

    uploadFiles(files: File[], albumUuid: string|undefined=undefined) {
        for (let i = 0; i < files.length; i++) {
            // Check mime types
            if (!files[i].type.startsWith('image/') && !files[i].type.startsWith('video/')) {
                this.upload_tasks.push({
                    file: files[i],
                    progress: 100,
                    error: 'Invalid file type',
                    status: 'complete',
                    albumUuid: albumUuid
                } as UploadTask);
                continue;
            }
            // Check file size
            if (files[i].size > 1024 * 1024 * 1024) {
                this.upload_tasks.push({
                    file: files[i],
                    progress: 100,
                    error: 'File too large',
                    status: 'complete',
                    albumUuid: albumUuid
                } as UploadTask);
                continue;
            }
            if (files[i].size < 1024) {
                this.upload_tasks.push({
                    file: files[i],
                    progress: 100,
                    error: 'File too small',
                    status: 'complete',
                    albumUuid: albumUuid
                } as UploadTask);
                continue;
            }
            // Queue upload
            this.upload_tasks.push({
                file: files[i],
                progress: 0,
                error: '',
                status: 'queued',
                albumUuid: albumUuid
            } as UploadTask);
        }
        this.startLoop();
    }
}