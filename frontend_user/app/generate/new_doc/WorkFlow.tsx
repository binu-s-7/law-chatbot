'use client';


import {useWorkFlow} from "@/app/generate/new_doc/WorkflowContext";
import PickTemplate from "@/app/generate/new_doc/PickTemplate";
import GetInput from "@/app/generate/new_doc/GetInput";
import CallApi from "@/app/generate/new_doc/CallApi";


export default function Workflow() {
    const {template, formData, document} = useWorkFlow();

    if (!template) {
        // return <div>Pick template</div>
        return <PickTemplate/>;
    } else if (!formData || Object.keys(formData).length === 0) {
        console.log("picked", template);
        console.log("formData", formData);
        console.log("document", document);
        // return <div>Get input</div>
        return <GetInput/>;
    } else if (!document) {
        console.log("picked", template);
        console.log("formData", formData);
        console.log("document", document);
        // return <div>Call API</div>
        return <CallApi/>;
    } else {
        console.log("picked", template);
        console.log("formData", formData);
        console.log("document", document);
        return <div>Chat session</div>
        // return <ChatSession />;
    }
}
