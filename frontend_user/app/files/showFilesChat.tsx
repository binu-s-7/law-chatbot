'use client';

import {useCallback, useContext, useEffect, useState} from "react";
import {AuthContext} from "@/components/AuthProvider";
import {createClientComponentClient} from "@supabase/auth-helpers-nextjs";
import {Database} from "@/types/supabase";
import FileModal from "@/app/files/fileModal";

export default function ShowFilesChat({params, selectedFiles, setSelectedFiles}) {
    const {accessToken} = useContext(AuthContext);
    const supabase = createClientComponentClient<Database>();
    const [loading, setLoading] = useState(true);
    const [files, setFiles] = useState([]);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentFile, setCurrentFile] = useState(null);
    const [isEditingFileName, setIsEditingFileName] = useState(false);
    const [editedFileName, setEditedFileName] = useState("");
    const [notFoundFiles, setNotFoundFiles] = useState([]);
    const [isSelectFilesModalOpen, setIsSelectFilesModalOpen] = useState(false);


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
        "pdf": "/file_placeholders/pdf_placeholder.png",
        "docx": "/file_placeholders/docx_placeholder.png", // Add placeholders for other types as needed
        "default": "/file_placeholders/default_file.png",
    };

    const getPreviewContent = (file) => {
        if (file.type.startsWith('image')) {
            return <img src={file.previewUrl || getFileTypeImage['default']} alt="File preview"
                        className="mb-2 max-w-full h-auto rounded"/>;
        } else if (file.type === 'application/pdf') {
            // Here you can return a PDF viewer component or a PDF icon
            return <img src={getFileTypeImage['pdf']} alt="PDF preview" className="mb-2 max-w-full h-auto rounded"/>;
        } else if (file.type.startsWith('video')) {
            // Here you can return a video player component or a video icon
            return <img src={getFileTypeImage['mp4']} alt="Video preview" className="mb-2 max-w-full h-auto rounded"/>;
        }
        // Add more conditions for other file types as needed
        else {
            // Default placeholder for unsupported types
            return <img src={getFileTypeImage['default']} alt="File preview"
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
    }, [params.id]);

    // const handleImageError = (fileId) => {
    //     setFiles(currentFiles => currentFiles.filter(file => file.file_id !== fileId));
    // };

    const FileSelectionModal = ({isOpen, onClose, files, onSelectionChange}) => {
        if (!isOpen) return null;

        const handleFileSelectionToggle = (fileId) => {
            // Find the file in the files array
            const file = files.find(file => file.file_id === fileId);
            if (file) {
                // Toggle its isSelected state and call onSelectionChange
                onSelectionChange(fileId, !file.isSelected);
            }

            console.log("selectedFiles", selectedFiles);
        };

        return (
            <div className="modal">
                {/* Modal content */}
                {files.map(file => (
                    <div key={file.file_id} className="mb-2">
                        <button
                            onClick={() => handleFileSelectionToggle(file.file_id)}
                            className={`p-2 text-white rounded ${file.isSelected ? 'bg-green-500' : 'bg-gray-500'}`}
                        >
                            {file.file_name}
                        </button>
                    </div>
                ))}
                {/*<button onClick={onClose} className="mt-4 p-2 bg-blue-500 text-white rounded">Close</button>*/}
            </div>
        );
    };


    const handleFileSelectionChange = (fileId, isSelected) => {
        // Check if the fileId already exists in the selectedFiles array
        if (selectedFiles.includes(fileId)) {
            // If it does, remove it (toggle off)
            setSelectedFiles(selectedFiles.filter(id => id !== fileId));
        } else {
            // If it doesn't, add it (toggle on)
            setSelectedFiles([...selectedFiles, fileId]);
        }
    };

    // Mark files as selected or not before passing to modal
    const filesWithSelectionState = files.map(file => ({
        ...file,
        isSelected: selectedFiles.includes(file.file_id),
    }));


    useEffect(() => {
        getFiles();
    }, [getFiles]);

    if (loading) return <p>Loading files...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div>

            <div>
                <h2>Selected Files</h2>
                {filesWithSelectionState.filter(file => file.isSelected).map(file => (
                    <div key={file.file_id}>{file.file_name}</div>
                ))}
                {/*<h2>Other Files</h2>*/}
                {/*{filesWithSelectionState.filter(file => !file.isSelected).map(file => (*/}
                {/*    <div key={file.file_id}>{file.file_name}</div>*/}
                {/*))}*/}
            </div>
            {isSelectFilesModalOpen && (
                <FileSelectionModal
                    isOpen={isSelectFilesModalOpen}
                    onClose={() => setIsSelectFilesModalOpen(false)}
                    files={files}
                    onSelectionChange={handleFileSelectionChange}
                />
            )}


            {/*<div className="flex flex-wrap -mx-4">*/}
            {/*    {files.map((file) => (*/}
            {/*        <div key={file.file_id} className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 p-4"*/}
            {/*             onClick={() => {*/}
            {/*                 setCurrentFile(file);*/}
            {/*                 setIsModalOpen(true);*/}
            {/*             }}>*/}
            {/*            <div className="bg-white shadow-md rounded-lg overflow-hidden">*/}
            {/*                <div className="p-5">*/}
            {/*                    <img*/}
            {/*                        src={file.previewUrl || getFileTypeImage['default']}*/}
            {/*                        alt="File preview"*/}
            {/*                        className="mb-2 max-w-full h-auto rounded"*/}
            {/*                        // onError={() => handleImageError(file.file_id)}*/}
            {/*                    />*/}
            {/*                    <h5 className="text-lg font-bold mb-2">{file.file_name}</h5>*/}
            {/*                    <p className="text-gray-700 text-base mb-2">{file.description}</p>*/}
            {/*                    /!* Prevent event propagation to avoid opening modal when clicking the delete button *!/*/}
            {/*                    <button*/}
            {/*                        onClick={(e) => {*/}
            {/*                            e.stopPropagation();*/}
            {/*                            deleteFile(file.file_id, file.file_name, e);*/}
            {/*                        }}*/}
            {/*                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"*/}
            {/*                    >*/}
            {/*                        Delete*/}
            {/*                    </button>*/}
            {/*                </div>*/}
            {/*            </div>*/}
            {/*        </div>*/}
            {/*    ))}*/}
            {/*</div>*/}
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
            <button onClick={() => setIsSelectFilesModalOpen(prevState => !prevState)}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                     stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round"
                          d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13"/>
                </svg>
            </button>
        </div>
    );
}
