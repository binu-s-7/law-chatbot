'use client';

// components/TemplateTable.js
import {useEffect, useState} from 'react';
import {createClientComponentClient} from "@supabase/auth-helpers-nextjs";
import {Database} from "@/types/supabase";

const tableConfig = [
    {header: 'ID', key: 'id', dataType: 'string', required: false, editable: true},
    {header: 'User ID', key: 'user_id', dataType: 'string', required: true, editable: false},
    {header: 'Like', key: 'like', dataType: 'boolean', formatter: value => value ? 'Yes' : 'No', required: false, editable: false},
    {header: 'Comment', key: 'comment', dataType: 'string', required: false, editable: false},
    {header: 'Actions', key: 'actions', dataType: 'actions'}
];


interface Feedback {
    id: string;
    user_id: string;
    like: boolean;
    comment: string;
}

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
    feedback: Feedback | null;
    onSave: (feedback: Feedback) => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, feedback, onSave }) => {
    const [localFeedback, setLocalFeedback] = useState({ user_id: '', like: false, comment: '' });

    useEffect(() => {
        if (feedback) {
            setLocalFeedback(feedback);
        }
    }, [feedback]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const finalValue = type === 'checkbox' ? checked : value;
        setLocalFeedback(prev => ({ ...prev, [name]: finalValue }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        onSave(localFeedback);
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
                                        checked={localFeedback[column.key] || false}
                                        onChange={handleChange}
                                        disabled={column.editable}
                                        className="ml-2 h-4 w-4 text-blue-600 border-gray-300 rounded"
                                    />
                                ) : (
                                    <input
                                        id={column.key}
                                        type={column.dataType === 'string' ? 'text' : 'number'}
                                        name={column.key}
                                        value={localFeedback[column.key] || ''}
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





const FeedbackTable: React.FC = () => {
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [currentFeedback, setCurrentFeedback] = useState<Feedback | null>(null);


    const supabase = createClientComponentClient<Database>();

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    const fetchFeedbacks = async () => {
        setIsLoading(true);
        const {data, error} = await supabase
            .from('feedback')
            .select('*');

        if (error) {
            console.error('Error fetching feedback:', error);
        } else {
            setFeedbacks(data);
        }
        setIsLoading(false);
    };

    const handleDelete = async (id) => {
        setIsLoading(true);
        console.log("Deleting", id)
        const {error} = await supabase
            .from('feedback')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting feedback:', error);
        } else {
            // Remove the feedback from local state
            setFeedbacks(prevFeedbacks => prevFeedbacks.filter(feedback => feedback.id !== id));
        }
        setIsLoading(false);
    };

    const handleSave = async (feedback) => {
        setIsLoading(true);
        if (feedback.id) {
            const {error} = await supabase
                .from('feedback')
                .update(feedback)
                .match({id: feedback.id});
            if (error) {
                console.error('Error updating feedback:', error);
                setIsLoading(false);
                return;
            }
        } else {
            const {error} = await supabase
                .from('feedback')
                .insert([feedback]);
            if (error) {
                console.error('Error adding feedback:', error);
                setIsLoading(false);
                return;
            }
        }
        fetchFeedbacks();
        setModalOpen(false);
        setIsLoading(false);
    };


    if (isLoading) return <p>Loading...</p>;

    return (
        <div className="overflow-x-auto m-10">
            <button
                onClick={() => {
                    setModalOpen(true);
                    setCurrentFeedback(null);
                }}
                className="mb-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
            >
                Add New Feedback
            </button>

            <FeedbackModal isOpen={modalOpen} onClose={() => setModalOpen(false)} feedback={currentFeedback}
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
                {feedbacks.map(feedback => (
                    <tr key={feedback.id} className="border-t border-gray-300 hover:bg-gray-100">
                        {tableConfig.map(column => (
                            <td key={`${feedback.id}-${column.key}`} className="py-2 px-6 text-left">
                                {column.dataType === 'actions' ? (
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => {
                                                setModalOpen(true);
                                                setCurrentFeedback(feedback);
                                            }}
                                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-xs"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(feedback.id)}
                                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-xs"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                ) : column.formatter ? column.formatter(feedback[column.key]) : feedback[column.key]}
                            </td>
                        ))}
                    </tr>
                ))}
                </tbody>
            </table>
        </div>

    );
};

export default FeedbackTable;
