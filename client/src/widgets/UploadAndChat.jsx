import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import {
  Card,
  CardBody,
  Typography,
  Input,
  Button,
  Tabs,
  TabsHeader,
  TabsBody,
  Tab,
  TabPanel
} from "@material-tailwind/react";
import { Oval } from 'react-loader-spinner';
import Swal from 'sweetalert2';
import './UploadAndChat.css';

const UploadAndChat = () => {
  const [pdfFiles, setPdfFiles] = useState([]);
  const [question, setQuestion] = useState("");
  const [chat, setChat] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [briefSummary, setBriefSummary] = useState("");
  const [detailedSummary, setDetailedSummary] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [chatLogs, setChatLogs] = useState([]);
  const [chatLogTitle, setChatLogTitle] = useState("");

  useEffect(() => {
    const loginStatus = localStorage.getItem('isLoggedIn') === 'Y';
    setIsLoggedIn(loginStatus);

    if (loginStatus) {
      fetchChatLogs(); // Fetch chat logs if logged in
    }
  }, []);

  const sampleQuestions = [
    "What is the main theme of the document?",
    "Summarize the document in 200 words.",
    "What are the key takeaways from the document?",
    "Can you provide an analysis of the main arguments?",
    "What lessons can be learned from this document?",
    "How does this document relate to recent events?"
  ];

  const fetchChatLogs = async () => {
    try {
      const userEmail = localStorage.getItem('userEmail'); // Assuming userEmail is stored in localStorage
      const response = await axios.get(`http://localhost:5000/api/chatLog/user/${userEmail}`);
      setChatLogs(response.data);
    } catch (error) {
      console.error('Error fetching chat logs:', error);
    }
  };

  const onDrop = (acceptedFiles) => {
    setPdfFiles([...pdfFiles, ...acceptedFiles]);
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: '.pdf' });

  const handleUpload = async () => {
    if (pdfFiles.length === 0) {
      Swal.fire({
        title: "ERROR!",
        text: "Please upload at least one PDF!",
        icon: "error"
      });
      return;
    }

    const formData = new FormData();
    pdfFiles.forEach(file => {
      formData.append('pdfs', file);
    });

    try {
      const response = await axios.post('http://localhost:5000/api/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      Swal.fire({
        title: "Success!",
        text: "Successfully uploaded the documents",
        icon: "success"
      });
      return;
    } catch (error) {
      console.error('Error uploading PDF(s):', error);
      Swal.fire({
        title: "ERROR!",
        text: "Failed to upload documents!",
        icon: "error"
      });
    }
  };

  const handleQuestionSubmit = async () => {
    if (pdfFiles.length === 0) {
      Swal.fire({
        title: "ERROR!",
        text: "Please upload at least one PDF before submitting a question.",
        icon: "error"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/questions/ask', { question });
      const newChat = { question, answer: response.data.answer };
      setChat([...chat, newChat]);
      setQuestion("");
    } catch (error) {
      console.error('Error asking question:', error);
      alert('Failed to get answer');
    } finally {
      setLoading(false);
    }
  };

  const handleSampleQuestionClick = (sampleQuestion) => {
    setQuestion(sampleQuestion);
  };

  const handleClearFiles = (event) => {
    event.stopPropagation();
    setPdfFiles([]);
  };

  const handleDeleteFile = (fileName, event) => {
    event.stopPropagation();
    setPdfFiles(pdfFiles.filter(file => file.name !== fileName));
  };

  const fetchBriefSummary = async () => {
    setSummaryLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/questions/askBriefSummary');
      setBriefSummary(response.data.answer);
    } catch (error) {
      console.error('Error fetching brief summary:', error);
      alert('Failed to fetch brief summary');
    } finally {
      setSummaryLoading(false);
    }
  };

  const fetchDetailedSummary = async () => {
    setSummaryLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/questions/askDetailedSummary');
      
      // Split the response by sections
      const sections = response.data.answer.split(/(Case Information|Parties involved|Legal issues|Facts of the Case|Procedural History|Legal Arguments|Court's Analysis|Decision or Outcome|Implications and Impact|Citations):/g);
  
      // Process the sections to add line breaks
      let formattedAnswer = "";
      for (let i = 1; i < sections.length; i += 2) {
        formattedAnswer += `<b>${sections[i]}:</b> ${sections[i + 1].replace(/\n/g, '<br>')}`;
      }
  
      setDetailedSummary(formattedAnswer.trim());
    } catch (error) {
      console.error('Error fetching detailed summary:', error);
      alert('Failed to fetch detailed summary');
    } finally {
      setSummaryLoading(false);
    }
  };
  
  const handleSaveChatLog = async () => {
    if (!chatLogTitle.trim()) {
      Swal.fire({
        title: "ERROR!",
        text: "Chat log title is required!",
        icon: "error"
      });
      return;
    }
  
    const userEmail = localStorage.getItem('userEmail');
    const title = chatLogTitle;
    const questionsAndAnswers = chat.map((chatItem) => ({
      question: chatItem.question,
      answer: chatItem.answer,
    }));
  
    const chatLog = { userEmail, title, questionsAndAnswers };
  
    try {
      await axios.post('http://localhost:5000/api/chatLog/save', chatLog);
      Swal.fire({
        title: "Success!",
        text: "Chat log saved successfully",
        icon: "success"
      });
      fetchChatLogs();
    } catch (error) {
      console.error('Error saving chat log:', error);
      Swal.fire({
        title: "ERROR!",
        text: "Failed to save chat log!",
        icon: "error"
      });
    }
  };
  

  return (
    <Card className={`shadow-lg border shadow-gray-500/10 rounded-lg p-6`}>
      {!isLoggedIn && (
        <div className="overlay">
          <div className="overlay-text">Create an account or login to use the tool</div>
        </div>
      )}
      <CardBody className={` ${isLoggedIn ? '' : 'blur'}`}>
        <Typography variant="h5" color="blue-gray" className="mb-4 font-bold">
          Upload PDF and Ask Questions
        </Typography>
        <div {...getRootProps()} className="mb-4 p-4 border-2 border-dashed border-blue-500 text-center cursor-pointer">
          <input {...getInputProps()} />
          {pdfFiles.length > 0 ? (
            <div>
              {pdfFiles.map(file => (
                <div key={file.name} className="flex justify-between items-center">
                  <p>{file.name}</p>
                  <Button onClick={(event) => handleDeleteFile(file.name, event)} variant="text" color="red">
                    Delete
                  </Button>
                </div>
              ))}
              <Button onClick={(event) => handleClearFiles(event)} variant="text" color="blue">
                Clear All
              </Button>
            </div>
          ) : (
            <p>Drag & drop PDF files here, or click to select files</p>
          )}
        </div>
        {pdfFiles.length > 0 && (
          <Button onClick={handleUpload} variant="gradient" size="lg" fullWidth>
            Upload PDF(s)
          </Button>
        )}
        <Tabs value="chat" className="mt-6">
          <TabsHeader>
            <Tab value="chat">Question & Answers</Tab>
            <Tab value="summarization">Summarization</Tab>
            <Tab value="tab3">History</Tab>
          </TabsHeader>
          <TabsBody>
            <TabPanel value="chat">
              <div className="mt-6 flex flex-wrap justify-center">
                {sampleQuestions.map((sampleQuestion, index) => (
                  <div key={index} className="w-1/3 p-2 flex justify-center">
                    <Button
                      variant="outlined"
                      size="sm"
                      className="text-gray-700 border-gray-400"
                      style={{ width: '20rem' }}
                      onClick={() => handleSampleQuestionClick(sampleQuestion)}
                    >
                      {sampleQuestion}
                    </Button>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <Input
                  variant="outlined"
                  size="lg"
                  label="Ask a question"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                />
                <Button onClick={handleQuestionSubmit} variant="gradient" size="lg" fullWidth className="mt-4">
                  Submit Question
                </Button>
              </div>
              {loading && (
                <div className="flex justify-center mt-4">
                  <Oval
                    height={50}
                    width={50}
                    color="#4fa94d"
                    wrapperStyle={{}}
                    wrapperClass=""
                    visible={true}
                    ariaLabel='oval-loading'
                    secondaryColor="#4fa94d"
                    strokeWidth={2}
                    strokeWidthSecondary={2}
                  />
                </div>
              )}
              <div className="mt-6">
                {chat.map((chatItem, index) => (
                  <div key={index} className="mb-4">
                    <Typography variant="small" color="blue-gray" className="font-normal">
                      <strong>Q:</strong> {chatItem.question}
                    </Typography>
                    <Typography variant="small" color="blue-gray" className="font-normal">
                      <strong>A:</strong> {chatItem.answer}
                    </Typography>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex items-center space-x-4">
              <div className="relative">
                <Input
                  variant="outlined"
                  size="lg"
                  label="Chat Log Title"
                  value={chatLogTitle}
                  onChange={(e) => setChatLogTitle(e.target.value)}
                  className="w-52"
                />
              </div>
              <Button onClick={handleSaveChatLog} variant="gradient" size="lg">
                Save Chat Log
              </Button>
            </div>
            </TabPanel>
            <TabPanel value="summarization">
              <div className="mt-6 flex justify-center items-center">
                <Button onClick={fetchBriefSummary} variant="gradient" size="lg" className="mr-4">
                  Brief Summary
                </Button>
                <Button onClick={fetchDetailedSummary} variant="gradient" size="lg">
                  Detailed Summary
                </Button>
              </div>
              {summaryLoading && (
                <div className="flex justify-center mt-4">
                  <Oval
                    height={50}
                    width={50}
                    color="#4fa94d"
                    wrapperStyle={{}}
                    wrapperClass=""
                    visible={true}
                    ariaLabel='oval-loading'
                    secondaryColor="#4fa94d"
                    strokeWidth={2}
                    strokeWidthSecondary={2}
                  />
                </div>
              )}
              <div className="mt-6">
                {briefSummary && (
                  <div className="mb-4">
                    <Typography variant="h6" color="blue-gray" className="font-bold">
                      Brief Summary:
                    </Typography>
                    <Typography variant="small" color="blue-gray" className="font-normal">
                      {briefSummary}
                    </Typography>
                  </div>
                )}
                {detailedSummary && (
                  <div className="mb-4">
                    <Typography variant="h6" color="blue-gray" className="font-bold">
                      Detailed Summary:
                    </Typography>
                    <Typography variant="small" color="blue-gray" className="font-normal">
                      <div dangerouslySetInnerHTML={{ __html: detailedSummary }} />
                    </Typography>
                  </div>
                )}
              </div>
            </TabPanel>
            <TabPanel value="tab3">
              <div className="mb-4 mt-6">
                <Typography variant="h6" color="blue-gray" className="font-bold">
                  Chat Logs
                </Typography>
                {chatLogs.length > 0 ? (
                  chatLogs.map((log, index) => (
                    <div key={index} className="mb-4 p-4 border border-gray-300 rounded-lg">
                      <Typography variant="body1" color="blue-gray" className="font-medium">
                        {log.title}
                      </Typography>
                      <Typography variant="body2" color="blue-gray" className="mt-2">
                        {log.date}
                      </Typography>
                      <div className="mt-4">
                        {log.questionsAndAnswers.map((qa, qaIndex) => (
                          <div key={qaIndex} className="mb-2">
                            <Typography variant="body2" color="blue-gray" className="font-medium">
                              Q: {qa.question}
                            </Typography>
                            <Typography variant="body2" color="blue-gray" className="mt-1">
                              A: {qa.answer}
                            </Typography>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <Typography variant="body2" color="blue-gray">
                    No chat logs available.
                  </Typography>
                )}
              </div>
            </TabPanel>
          </TabsBody>
        </Tabs>
      </CardBody>
    </Card>
  );
};

export default UploadAndChat;
