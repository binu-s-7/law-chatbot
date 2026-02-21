'use client';

import React, {useCallback, useEffect, useState} from "react";
import {AuthContext} from "@/components/AuthProvider";
import {createClientComponentClient} from "@supabase/auth-helpers-nextjs";
import {Database} from "@/types/supabase";
import FileModal from "@/app/dashboard/files/fileModal";

export default function ShowFiles() {
    const supabase = createClientComponentClient<Database>();
    const [loading, setLoading] = useState(true);
    const [files, setFiles] = useState([]);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentFile, setCurrentFile] = useState(null);
    const [isEditingFileName, setIsEditingFileName] = useState(false);
    const [editedFileName, setEditedFileName] = useState("");
    const [notFoundFiles, setNotFoundFiles] = useState([]);

    const {accessToken, user} = React.useContext(AuthContext);

    // Function to open the modal with the selected file's details
    const openModal = (file) => {
        setCurrentFile(file);
        setIsModalOpen(true);
    };

    // Function to close the modal
    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentFile(null); // Reset current file
    };

    const getFileTypeImage = {
        "jpg": "/file_placeholders/jpg_placeholder.png",
        "png": "/file_placeholders/png_placeholder.png",
        "mp3": "/file_placeholders/default_file.png",
        "mp4": "/file_placeholders/default_file.png",
        "pdf": "/file_placeholders/default_file.png",
        "docx": "/file_placeholders/docx_placeholder.png", // Add placeholders for other types as needed
        "default": "/file_placeholders/default_file.png",
    };

    const getDefaultImage = (event) => {
        event.target.src = getFileTypeImage['default'];
    };

    const getPreviewContent = (file) => {
        try {
            if (file.type.startsWith('image')) {
                return <img src={file.previewUrl || getFileTypeImage['default']} alt="File preview"
                            onError={getDefaultImage} className="mb-2 max-w-full h-auto rounded"/>;
            } else if (file.type === 'application/pdf') {
                return <img src={getFileTypeImage['pdf']} alt="PDF preview" onError={getDefaultImage}
                            className="mb-2 max-w-full h-auto rounded"/>;
            } else if (file.type.startsWith('video')) {
                return <img src={getFileTypeImage['mp4']} alt="Video preview" onError={getDefaultImage}
                            className="mb-2 max-w-full h-auto rounded"/>;
            }
            // Add more conditions for other file types as needed
            else {
                // Default placeholder for unsupported types
                return <img src={getFileTypeImage['default']} alt="File preview" onError={getDefaultImage}
                            className="mb-2 max-w-full h-auto rounded"/>;
            }
        } catch (error) {
            console.error('Error getting preview content:', error.message);
            return <img src={getFileTypeImage['default']} alt="File preview" onError={getDefaultImage}
                        className="mb-2 max-w-full h-auto rounded"/>;
        }
    };

    const deleteFile = async (fileId, fileName, e) => {
        e.stopPropagation(); // Prevent modal from opening

        try {
            setLoading(true);

            const {error: deleteError} = await supabase.storage.from('files').remove([fileName]);
            if (deleteError) throw deleteError;

            const {error: dbError} = await supabase.from('files').delete().match({file_id: fileId});
            if (dbError) throw dbError;

            getFiles(); // Refresh the files list
        } catch (error) {
            console.error('Error deleting file:', error.message);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const renameFileInStorage = async (oldFileName, newFileName) => {
        try {
            // Download the old file
            const {data: oldFile, error: downloadError} = await supabase.storage.from('files').download(oldFileName);
            if (downloadError) throw downloadError;

            // Create a new file with the new name and the content of the old file
            const {error: uploadError} = await supabase.storage.from('files').upload(newFileName, oldFile);
            if (uploadError) throw uploadError;

            // Delete the old file
            const {error: deleteError} = await supabase.storage.from('files').remove([oldFileName]);
            if (deleteError) throw deleteError;

            return true;
        } catch (error) {
            console.error('Error renaming file in storage:', error.message);
            return false;
        }
    };


    const editFileName = async (newFileName) => {
        if (!currentFile || !newFileName || newFileName === currentFile.file_name) return;

        setLoading(true);

        const renameSuccess = await renameFileInStorage(currentFile.file_name, newFileName);
        if (!renameSuccess) {
            setError('Failed to rename file in storage.');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const {error} = await supabase
                .from('files')
                .update({file_name: newFileName})
                .match({file_id: currentFile.file_id});

            if (error) throw error;

            // Successfully updated
            const updatedFiles = files.map(file =>
                file.file_id === currentFile.file_id ? {...file, file_name: newFileName} : file
            );
            setFiles(updatedFiles);
            setCurrentFile({...currentFile, file_name: newFileName}); // Update modal view

            // closeModal(); // Optionally close modal after editing
        } catch (error) {
            console.error('Error updating file name:', error.message);
            setError(error.message);
        } finally {
            setLoading(false);
            setIsEditingFileName(false); // Ensure to exit editing mode
        }
    };


    const getFiles = useCallback(async () => {
        try {
            setLoading(true);
            const {data: metaData, error: metaError} = await supabase
                .from('files')
                .select()
                // .eq('user_id', user.id)

            if (metaError) throw metaError;

            const filePreviews = metaData.map(file => ({
                ...file,
                previewUrl: file.type.startsWith('image') ?
                    supabase.storage.from('files').getPublicUrl(file.file_name).data.publicUrl :
                    getFileTypeImage[file.extension] || getFileTypeImage["default"]
            }));

            setFiles(filePreviews);
        } catch (error) {
            console.error('Error loading files:', error.message);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // const handleImageError = (fileId) => {
    //     setFiles(currentFiles => currentFiles.filter(file => file.file_id !== fileId));
    // };

    useEffect(() => {
        getFiles();
    }, [getFiles]);

    if (loading) return <p>Loading files...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div>
            {/*<h1>Files</h1>*/}
            <div className="flex flex-wrap mx-4">
                {console.log(files)}
                {files.map((file) => (
                    <div key={file.file_id} className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 p-4"
                         onClick={() => {
                             setCurrentFile(file);
                             setIsModalOpen(true);
                         }}>
                        <div className="bg-white shadow-md rounded-lg overflow-hidden">
                            <div className="p-5">
                                <img
                                    src={file.previewUrl || getFileTypeImage['default']}
                                    alt="File preview"
                                    className="mb-2 max-w-full h-auto rounded"
                                    // onError={() => handleImageError(file.file_id)}
                                />
                                <h5 className="text-lg font-bold mb-2">{file.file_name}</h5>
                                <p className="text-gray-700 text-base mb-2">{file.description}</p>
                                {/* Prevent event propagation to avoid opening modal when clicking the delete button */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteFile(file.file_id, file.file_name, e);
                                    }}
                                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {notFoundFiles.length > 0 && (
                <div className="text-red-500">
                    <p>The following files could not be found:</p>
                    <ul>
                        {notFoundFiles.map((fileName) => (
                            <li key={fileName}>{fileName}</li>
                        ))}
                    </ul>
                </div>
            )}


            {isModalOpen && currentFile && (
                <FileModal currentFile={currentFile} setIsEditingFileName={setIsEditingFileName}
                           setEditedFileName={setEditedFileName}
                           isEditingFileName={isEditingFileName} editedFileName={editedFileName}
                           editFileName={editFileName}
                           closeModal={closeModal} getFileTypeImage={getFileTypeImage}/>
            )}

        </div>
    );
}
