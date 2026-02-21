'use client';

// components/FilesTable.js
import React, {useEffect, useState} from 'react';
import {createClientComponentClient} from "@supabase/auth-helpers-nextjs";
import {Database} from "@/types/supabase";

function formatTextWithLineBreaks(text) {
    return text.split('\n').map((line, index) => (
        <React.Fragment key={index}>
            {line}
            <br/>
        </React.Fragment>
    ));
}


const tableConfig = [
    {header: 'ID', key: 'file_id', dataType: 'string', required: true, editable: true},
    {header: 'User ID', key: 'user_id', dataType: 'string', required: false, editable: false},
    {header: 'Name', key: 'file_name', dataType: 'string', required: false, editable: false},
    {header: 'Extension', key: 'extension', dataType: 'string', required: false, editable: false},
    {header: 'By Admin', key: 'by_admin', dataType: 'boolean', formatter: value => value ? 'Yes' : 'No', required: false, editable: false},
    {header: 'Actions', key: 'actions', dataType: 'actions'}
];

interface Files {
    file_id: number;
    user_id: string;
    file_name: string;
    extension: string;
    by_admin: boolean;
}

interface FilesModalProps {
    isOpen: boolean;
    onClose: () => void;
    files: Files | null;
    onSave: (files: Files) => void;
}


const FilesModal: React.FC<FilesModalProps> = ({isOpen, onClose, files, onSave}) => {
    const [localFiles, setLocalFiles] = useState({file_name: '', by_admin: true});

    useEffect(() => {
        if (files) {
            setLocalFiles(files);
        }
    }, [files]);

    const handleChange = (e) => {
        const {name, value, type, checked} = e.target;
        const finalValue = type === 'checkbox' ? checked : value;
        setLocalFiles(prev => ({...prev, [name]: finalValue}));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Saving", localFiles);
        onSave(localFiles);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black bg-opacity-50"></div>

            {/* Modal Content */}
            <div className="z-50 bg-white p-5 border border-gray-200 rounded-md shadow-lg w-full md:w-2/3">
                <form onSubmit={handleSubmit} className="space-y-4">
                    {tableConfig.map(column => {
                        if (column.dataType === 'actions') return null; // Skip actions in the form
                        return (
                            <div key={column.key}>
                                <label htmlFor={column.key} className="block text-sm font-medium text-gray-700">
                                    {column.header}:
                                </label>
                                {column.dataType === 'boolean' ? (
                                    <input
                                        id={column.key}
                                        type="checkbox"
                                        name={column.key}
                                        checked={localFiles[column.key] || false}
                                        onChange={handleChange}
                                        disabled={column.editable}
                                        className="ml-2 h-4 w-4 text-blue-600 border-gray-300 rounded"
                                    />
                                ) : (
                                    <input
                                        id={column.key}
                                        type={column.dataType === 'string' ? 'text' : 'number'}
                                        name={column.key}
                                        value={localFiles[column.key] || ''}
                                        onChange={handleChange}
                                        required={column.required}
                                        disabled={column.editable}
                                        className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm"
                                    />
                                )}
                            </div>
                        );
                    })}
                    <div className="flex justify-between">
                        <button type="submit"
                                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-500 hover:bg-blue-700">
                            Save
                        </button>
                        <button type="button" onClick={onClose}
                                className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const FilesTable = () => {
    const [files, setFiles] = useState<Files[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [currentFiles, setCurrentFiles] = useState<Files | null>(null);

    const supabase = createClientComponentClient<Database>();

    useEffect(() => {
        fetchFiles();
    }, []);


    const fetchFiles = async () => {
        setIsLoading(true);
        const {data, error} = await supabase
            .from('files')
            .select('*');

        if (error) {
            console.error('Error fetching files:', error);
        } else {
            setFiles(data);
        }
        setIsLoading(false);
    };

    const handleDelete = async (id) => {
        setIsLoading(true);
        console.log("Deleting", id)
        const {error} = await supabase
            .from('files')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting files:', error);
        } else {
            // Remove the files from local state
            setFiles(prevFiles => prevFiles.filter(files => files.file_id !== id));
        }
        setIsLoading(false);
    };

    const handleSave = async (files) => {
        setIsLoading(true);
        if (files.file_id) {
            const file_id = files.file_id;
            delete files.file_id;
            console.log("Updating", files)
            const {error} = await supabase
                .from('files')
                .update(files)
                .match({file_id: file_id});
            if (error) {
                console.error('Error updating files:', error);
                setIsLoading(false);
                return;
            }
        } else {
            console.log("Adding", files)
            const {error} = await supabase
                .from('files')
                .insert([files]);
            if (error) {
                console.error('Error adding files:', error);
                setIsLoading(false);
                return;
            }
        }
        fetchFiles();
        setModalOpen(false);
        setIsLoading(false);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setCurrentFiles(null); // Reset the currentFiles when closing the modal
    };

    if (isLoading) return <p>Loading...</p>;

    return (
        <div className="overflow-x-auto m-10">
            {/*<button*/}
            {/*    onClick={() => {*/}
            {/*        setModalOpen(true);*/}
            {/*        setCurrentFiles(null);*/}
            {/*    }}*/}
            {/*    className="mb-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200"*/}
            {/*>*/}
            {/*    Add New Files*/}
            {/*</button>*/}

            <FilesModal isOpen={modalOpen} onClose={handleCloseModal} files={currentFiles} onSave={handleSave}/>

            <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-lg">
                <thead className="bg-gray-800 text-white">
                <tr>
                    {tableConfig.map(column => (
                        <th key={column.key} className="py-3 px-6 text-left align-text-top">{column.header}</th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {files.map(files => (
                    <tr key={files.file_id} className="border-t border-gray-300 hover:bg-gray-100">
                        {tableConfig.map(column => (
                            <td key={`${files.file_id}-${column.key}`}
                                className="py-2 px-6 text-left align-text-top">
                                {column.dataType === 'actions' ? (
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => {
                                                setModalOpen(true);
                                                // setCurrentFiles(files);
                                                setCurrentFiles({...files});
                                            }}
                                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-xs"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(files.file_id)}
                                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-xs"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                ) : column.formatter ? column.formatter(files[column.key]) : files[column.key]}
                            </td>
                        ))}
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default FilesTable;