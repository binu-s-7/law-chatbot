'use client';

// Create a context
import React, {useContext, useState} from "react";

const WorkflowContext = React.createContext(null);

// Custom hook to use the chat context
export const useWorkFlow = () => {
    const context = useContext(WorkflowContext);
    if (context === undefined) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
};

// Context provider component
export const WorkflowProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const [template, setTemplate] = useState(null);
    const [formData, setFormData] = useState({});
    const [document, setDocument] = useState(null);

    const pickTemplate = (template) => setTemplate(template);
    const submitFormData = (data) => setFormData(data);
    const receiveDocument = (doc) => setDocument(doc);

    return (
        <WorkflowContext.Provider value={{template, formData, document, pickTemplate, submitFormData, receiveDocument}}>
            {children}
        </WorkflowContext.Provider>
    );
}

