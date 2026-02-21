'use client';

// components/FilesTable.js
import React, {useEffect, useState} from 'react';
import {createClientComponentClient} from "@supabase/auth-helpers-nextjs";
import {Database} from "@/types/supabase";
import {AuthContext} from "@/components/AuthProvider";

function formatTextWithLineBreaks(text) {
    return text.split('\n').map((line, index) => (
        <React.Fragment key={index}>
            {line}
            <br/>
        </React.Fragment>
    ));
}


const tableConfig = [
    {header: 'ID', key: 'id', dataType: 'string', required: true, editable: true},
    {header: 'User Name', key: 'username', dataType: 'string', required: false, editable: false},
    {header: 'Email', key: 'email', dataType: 'string', required: false, editable: false},
    {header: 'First Name', key: 'first_name', dataType: 'string', required: false, editable: false},
    {header: 'Second Name', key: 'second_name', dataType: 'string', required: false, editable: false},
    {header: 'Actions', key: 'actions', dataType: 'actions'}
];

interface Profile {
    id: string;
    username: string;
    email: string;
    first_name: string;
    second_name: string;
}

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    profile: Profile | null;
    onSave: (profile: Profile) => void;
}


const ProfileModal: React.FC<ProfileModalProps> = ({isOpen, onClose, profile, onSave}) => {
    const [localProfile, setLocalProfile] = useState({username: '', email: '', first_name: '', second_name: ''});

    useEffect(() => {
        if (profile) {
            setLocalProfile(profile);
        }
    }, [profile]);

    const handleChange = (e) => {
        const {name, value, type, checked} = e.target;
        const finalValue = type === 'checkbox' ? checked : value;
        setLocalProfile(prev => ({...prev, [name]: finalValue}));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        onSave(localProfile);
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
                                        checked={localProfile[column.key] || false}
                                        onChange={handleChange}
                                        disabled={column.editable}
                                        className="ml-2 h-4 w-4 text-blue-600 border-gray-300 rounded"
                                    />
                                ) : (
                                    <input
                                        id={column.key}
                                        type={column.dataType === 'string' ? 'text' : 'number'}
                                        name={column.key}
                                        value={localProfile[column.key] || ''}
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


const ProfileTable = () => {
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);

    const supabase = createClientComponentClient<Database>();
    const {accessToken, user} = React.useContext(AuthContext);

    useEffect(() => {
        fetchProfiles();
    }, []);


    const fetchProfiles = async () => {
        setIsLoading(true);
        const {data, error} = await supabase
            .from('profiles')
            .select('*')
            .neq('id', user.id)

        if (error) {
            console.error('Error fetching profile:', error);
        } else {
            setProfiles(data);
        }
        setIsLoading(false);
    };

    const handleDelete = async (id) => {
        setIsLoading(true);
        console.log("Deleting", id)
        const {error} = await supabase
            .from('profiles')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting profile:', error);
        } else {
            // Remove the profile from local state
            setProfiles(prevProfiles => prevProfiles.filter(profile => profile.id !== id));
        }
        setIsLoading(false);
    };

    const handleSave = async (profile) => {
        setIsLoading(true);
        if (profile.id) {
            console.log("Updating", profile)
            const {error} = await supabase
                .from('profiles')
                .update(profile)
                .match({id: profile.id});
            if (error) {
                console.error('Error updating profile:', error);
                setIsLoading(false);
                return;
            }
        } else {
            const {error} = await supabase
                .from('profile')
                .insert([profile]);
            if (error) {
                console.error('Error adding profile:', error);
                setIsLoading(false);
                return;
            }
        }
        fetchProfiles();
        setModalOpen(false);
        setIsLoading(false);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setCurrentProfile(null); // Reset the currentProfile when closing the modal
    };

    if (isLoading) return <p>Loading...</p>;

    return (
        <div className="overflow-x-auto m-10">
            <button
                onClick={() => {
                    setModalOpen(true);
                    setCurrentProfile(null);
                }}
                className="mb-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
            >
                Add New Profile
            </button>

            <ProfileModal isOpen={modalOpen} onClose={handleCloseModal} profile={currentProfile} onSave={handleSave}/>

            <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-lg">
                <thead className="bg-gray-800 text-white">
                <tr>
                    {tableConfig.map(column => (
                        <th key={column.key} className="py-3 px-6 text-left align-text-top">{column.header}</th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {profiles.map(profile => (
                    <tr key={profile.id} className="border-t border-gray-300 hover:bg-gray-100">
                        {tableConfig.map(column => (
                            <td key={`${profile.id}-${column.key}`}
                                className="py-2 px-6 text-left align-text-top">
                                {column.dataType === 'actions' ? (
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => {
                                                setModalOpen(true);
                                                // setCurrentProfile(profile);
                                                setCurrentProfile({...profile});
                                            }}
                                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-xs"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(profile.id)}
                                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-xs"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                ) : column.formatter ? column.formatter(profile[column.key]) : profile[column.key]}
                            </td>
                        ))}
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default ProfileTable;