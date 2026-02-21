'use client';

// components/TemplateTable.js
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
    {header: 'ID', key: 'template_id', dataType: 'string', required: false, editable: true},
    {header: 'Name', key: 'name', dataType: 'string', required: true, editable: false},
    {
        header: 'Content',
        key: 'content',
        dataType: 'string',
        formatter: formatTextWithLineBreaks,
        required: true,
        editable: false
    },
    {header: 'By Admin', key: 'by_admin', dataType: 'boolean', formatter: value => value ? 'Yes' : 'No', required: false, editable: false},
    {header: 'User ID', key: 'user_id', dataType: 'string', required: false, editable: true},
    {header: 'Actions', key: 'actions', dataType: 'actions'}
];

interface Template {
    template_id: string;
    name: string;
    content: string;
    by_admin: boolean;
    user_id: string;
}

interface TemplateModalProps {
    isOpen: boolean;
    onClose: () => void;
    template: Template | null;
    onSave: (template: Template) => void;
}


const TemplateModal: React.FC<TemplateModalProps> = ({ isOpen, onClose, template, onSave }) => {
    const [localTemplate, setLocalTemplate] = useState({ name: "", content: "", by_admin: true});

    useEffect(() => {
        if (template) {
            setLocalTemplate(template);
        }
    }, [template]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const finalValue = type === 'checkbox' ? checked : value;
        setLocalTemplate(prev => ({ ...prev, [name]: finalValue }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        onSave(localTemplate);
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
                                        checked={localTemplate[column.key] || false}
                                        onChange={handleChange}
                                        disabled={column.editable}
                                        className="ml-2 h-4 w-4 text-blue-600 border-gray-300 rounded"
                                    />
                                ) : (
                                    <input
                                        id={column.key}
                                        type={column.dataType === 'string' ? 'text' : 'number'}
                                        name={column.key}
                                        value={localTemplate[column.key] || ''}
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


const TemplateTable = () => {
    const [Templates, setTemplates] = useState<Template[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [currentTemplate, setCurrentTemplate] = useState<Template | null>(null);

    const supabase = createClientComponentClient<Database>();

    useEffect(() => {
        fetchTemplates();
    }, []);


    const fetchTemplates = async () => {
        setIsLoading(true);
        const {data, error} = await supabase
            .from('doc_templates')
            .select('*');

        if (error) {
            console.error('Error fetching template:', error);
        } else {
            setTemplates(data);
        }
        setIsLoading(false);
    };

    const handleDelete = async (id) => {
        setIsLoading(true);
        console.log("Deleting", id)
        const {error} = await supabase
            .from('doc_templates')
            .delete()
            .eq('template_id', id);

        if (error) {
            console.error('Error deleting template:', error);
        } else {
            // Remove the template from local state
            setTemplates(prevTemplates => prevTemplates.filter(template => template.template_id !== id));
        }
        setIsLoading(false);
    };

    const handleSave = async (template) => {
        setIsLoading(true);
        if (template.template_id) {
            const template_id = template.template_id;
            // remove the template_id from the template object
            delete template.template_id;
            console.log("Updating", template)

            const {error} = await supabase
                .from('doc_templates')
                .update(template)
                .match({template_id: template_id});
            if (error) {
                console.error('Error updating template:', error);
                setIsLoading(false);
                return;
            }
        } else {
            // console.log("Adding", template)
            const {error} = await supabase
                .from('doc_templates')
                .insert([template]);
            if (error) {
                console.error('Error adding template:', error);
                setIsLoading(false);
                return;
            }
        }
        fetchTemplates();
        setModalOpen(false);
        setIsLoading(false);
    };


    if (isLoading) return <p>Loading...</p>;

    return (
        <div className="overflow-x-auto m-10">
            <button
                onClick={() => {
                    setModalOpen(true);
                    setCurrentTemplate(null);
                }}
                className="mb-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
            >
                Add New Template
            </button>

            <TemplateModal isOpen={modalOpen} onClose={() => setModalOpen(false)} template={currentTemplate}
                           onSave={handleSave}/>

            <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-lg">
                <thead className="bg-gray-800 text-white">
                <tr>
                    {tableConfig.map(column => (
                        <th key={column.key} className="py-3 px-6 text-left align-text-top">{column.header}</th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {Templates.map(template => (
                    <tr key={template.template_id} className="border-t border-gray-300 hover:bg-gray-100">
                        {tableConfig.map(column => (
                            <td key={`${template.template_id}-${column.key}`}
                                className="py-2 px-6 text-left align-text-top">
                                {column.dataType === 'actions' ? (
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => {
                                                setModalOpen(true);
                                                setCurrentTemplate(template);
                                            }}
                                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-xs"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(template.template_id)}
                                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-xs"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                ) : column.formatter ? column.formatter(template[column.key]) : template[column.key]}
                            </td>
                        ))}
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default TemplateTable;