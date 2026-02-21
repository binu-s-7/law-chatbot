export default function FileModal({
                                      currentFile,
                                      setIsEditingFileName,
                                      setEditedFileName,
                                      isEditingFileName,
                                      editedFileName,
                                      editFileName,
                                      closeModal,
                                      getFileTypeImage
                                  }) {
    return (

        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-lg flex max-h-[80%] max-w-[90%] overflow-auto"
                 style={{width: '80%'}}>
                <div className="flex-1 border-r-2 pr-4">
                    <h2 className="text-2xl font-bold mb-4">File Details</h2>
                    <div className="mb-4">
                        <img
                            src={currentFile.previewUrl || getFileTypeImage['default']}
                            alt="File preview"
                            className="mb-2 max-w-full h-auto rounded"
                        />
                    </div>
                    <div className="mb-3 flex items-center justify-between">
                        {isEditingFileName ? (
                            <>
                                <input
                                    type="text"
                                    value={editedFileName}
                                    onChange={(e) => setEditedFileName(e.target.value)}
                                    className="border p-1 w-full"
                                />
                                <button
                                    onClick={() => editFileName(editedFileName)}
                                    className="ml-2 py-2 px-4 rounded flex items-center"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                         strokeWidth={1.5} stroke="currentColor"
                                         className="w-6 h-6 ml-2 text-green-500 hover:text-green-700 outline-green-600">
                                        <path strokeLinecap="round" strokeLinejoin="round"
                                              d="m4.5 12.75 6 6 9-13.5"/>
                                    </svg>
                                </button>
                            </>
                        ) : (
                            <>
                                <p><strong>Name:</strong> {currentFile.file_name}</p>
                                <button
                                    onClick={() => {
                                        setIsEditingFileName(true);
                                        setEditedFileName(currentFile.file_name);
                                    }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                         strokeWidth={1.5} stroke="currentColor"
                                         className="w-6 h-6 ml-2 text-blue-300 hover:text-blue-500 mr-2">
                                        <path strokeLinecap="round" strokeLinejoin="round"
                                              d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"/>
                                    </svg>
                                </button>
                            </>
                        )}
                    </div>
                    <p><strong>Description:</strong> {currentFile.description}</p>
                    {/* Other file details you want to include */}
                </div>
                <div className="flex-1 pl-4">
                    {/* Any other information you want to display on the right side of the modal */}
                    <div className="text-xl font-bold">
                        Extracted Data:
                    </div>
                    <br/>
                    <div className="text-lg">
                        {currentFile.extracted_data}
                    </div>
                </div>
            </div>
            <button onClick={closeModal}
                    className="absolute top-0 right-0 mt-2 mr-2 bg-gray-100 hover:bg-gray-200 text-black font-bold py-2 px-4 rounded-full">
                X
            </button>
        </div>

    );
}