'use client';
import {useRef} from 'react';

interface NewFilesProps {
    onUploadSuccess: (fileName: string, imageUrl: string) => void;
}

export default function AddFilesIcon({onUploadSuccess}: NewFilesProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    // const [imagess, setImages] = useState(null);

    const triggerFileInput = () => {
        // Make sure we are accessing `current` and it's not null
        fileInputRef.current?.click();
    };

    const uploadFile = async (file) => {
        console.log('uploadFile', file);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', 'title');
        formData.append('description', 'description');

        // Make an API request to your server-side endpoint
        const response = await fetch('/api/files', {
            method: 'POST',
            body: formData,
        });

        // Handle the response from the server
        if (response.ok) {
            console.log('File uploaded successfully', response.status);
            const data = await response.json();
            const imageUrl = data.url;
            const fileName = data.filename;
            onUploadSuccess(fileName, imageUrl);
            // setImages(imageUrl);
        } else {
            console.error('File upload failed with status', response.status);
        }
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            console.log('file', file);
            uploadFile(file);
        }
        event.target.value = '';
        console.log("Finished handleFileChange");
    };

    return (
        <div className="file-upload-button">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{display: 'none'}}
            />
            <button onClick={triggerFileInput} className="attachment-icon-button">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd"
                          d="M9 7C9 4.23858 11.2386 2 14 2C16.7614 2 19 4.23858 19 7V15C19 18.866 15.866 22 12 22C8.13401 22 5 18.866 5 15V9C5 8.44772 5.44772 8 6 8C6.55228 8 7 8.44772 7 9V15C7 17.7614 9.23858 20 12 20C14.7614 20 17 17.7614 17 15V7C17 5.34315 15.6569 4 14 4C12.3431 4 11 5.34315 11 7V15C11 15.5523 11.4477 16 12 16C12.5523 16 13 15.5523 13 15V9C13 8.44772 13.4477 8 14 8C14.5523 8 15 8.44772 15 9V15C15 16.6569 13.6569 18 12 18C10.3431 18 9 16.6569 9 15V7Z"
                          fill="currentColor"
                    />
                </svg>
            </button>
        </div>
    );
}