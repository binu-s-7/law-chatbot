'use client';

// components/TemplateTable.js
import {useEffect, useState} from 'react';
import {createClientComponentClient} from "@supabase/auth-helpers-nextjs";
import {Database} from "@/types/supabase";

const tableConfig = [
    {header: 'ID', key: 'id', dataType: 'string', required: false, editable: true},
    {header: 'User ID', key: 'user_id', dataType: 'string', required: false, editable: false},
    {header: 'Title', key: 'title', dataType: 'string', required: false, editable: false},
    {header: 'Body', key: 'body', dataType: 'string', required: true, editable: false},
    {header: 'Actions', key: 'actions', dataType: 'actions'}
];


interface Notification {
    id: string;
    user_id: string;
    title: string;
    body: string;
}

interface NotificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    notification: Notification | null;
    onSave: (notification: Notification) => void;
}

const NotificationModal: React.FC<NotificationModalProps> = ({isOpen, onClose, notification, onSave}) => {
    const [localNotification, setLocalNotification] = useState( {title: '', body: ''});

    useEffect(() => {
        if (notification) {
            setLocalNotification(notification);
        }
    }, [notification]);

    const handleChange = (e) => {
        const {name, value, type, checked} = e.target;
        const finalValue = type === 'checkbox' ? checked : value;
        setLocalNotification(prev => ({...prev, [name]: finalValue}));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        onSave(localNotification);
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
                                        checked={localNotification[column.key] || false}
                                        onChange={handleChange}
                                        disabled={column.editable}
                                        className="ml-2 h-4 w-4 text-blue-600 border-gray-300 rounded"
                                    />
                                ) : (
                                    <input
                                        id={column.key}
                                        type={column.dataType === 'string' ? 'text' : 'number'}
                                        name={column.key}
                                        value={localNotification[column.key] || ''}
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


const NotificationTable: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [currentNotification, setCurrentNotification] = useState<Notification | null>(null);


    const supabase = createClientComponentClient<Database>();

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        setIsLoading(true);
        const {data, error} = await supabase
            .from('notification')
            .select('*');

        if (error) {
            console.error('Error fetching notification:', error);
        } else {
            setNotifications(data);
        }
        setIsLoading(false);
    };

    const handleDelete = async (id) => {
        setIsLoading(true);
        console.log("Deleting", id)
        const {error} = await supabase
            .from('notification')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting notification:', error);
        } else {
            // Remove the notification from local state
            setNotifications(prevNotifications => prevNotifications.filter(notification => notification.id !== id));
        }
        setIsLoading(false);
    };

    const handleSave = async (notification) => {
        setIsLoading(true);
        if (notification.id) {
            console.log("Updating", notification)
            const {error} = await supabase
                .from('notification')
                .update(notification)
                .match({id: notification.id});
            if (error) {
                console.error('Error updating notification:', error);
                setIsLoading(false);
                return;
            }
        } else {
            console.log("Adding", notification)
            const {error} = await supabase
                .from('notification')
                .insert([notification]);
            if (error) {
                console.error('Error adding notification:', error);
                setIsLoading(false);
                return;
            }
        }
        fetchNotifications();
        setModalOpen(false);
        setIsLoading(false);
    };


    if (isLoading) return <p>Loading...</p>;

    return (
        <div className="overflow-x-auto m-10">
            <button
                onClick={() => {
                    setModalOpen(true);
                    setCurrentNotification(null);
                }}
                className="mb-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
            >
                Add New Notification
            </button>

            <NotificationModal isOpen={modalOpen} onClose={() => setModalOpen(false)} notification={currentNotification}
                           onSave={handleSave}/>

            <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-lg">
                <thead className="bg-gray-800 text-white">
                <tr>
                    {tableConfig.map(column => (
                        <th key={column.key} className="py-3 px-6 text-left">{column.header}</th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {notifications.map(notification => (
                    <tr key={notification.id} className="border-t border-gray-300 hover:bg-gray-100">
                        {tableConfig.map(column => (
                            <td key={`${notification.id}-${column.key}`} className="py-2 px-6 text-left">
                                {column.dataType === 'actions' ? (
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => {
                                                setModalOpen(true);
                                                setCurrentNotification(notification);
                                            }}
                                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-xs"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(notification.id)}
                                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-xs"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                ) : column.formatter ? column.formatter(notification[column.key]) : notification[column.key]}
                            </td>
                        ))}
                    </tr>
                ))}
                </tbody>
            </table>
        </div>

    );
};

export default NotificationTable;
