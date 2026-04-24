import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Maximize, ShieldAlert, CheckCircle, Video, Volume2, BookOpen, Edit3, Send, User as UserIcon } from "lucide-react";
import { useMutation, useSubscription, gql } from "@apollo/client";
import useAuthStore from "../store/authStore";

const MAX_WARNINGS = 3;

const SEND_EXAM_MESSAGE = gql`
    mutation SendExamMessage($roomId: String!, $content: String!, $senderName: String!) {
        sendExamMessage(roomId: $roomId, content: $content, senderName: $senderName) {
            id
            senderName
            content
            createdAt
        }
    }
`;

const EXAM_MESSAGE_SUBSCRIPTION = gql`
    subscription OnExamMessageReceived($roomId: String!) {
        examMessageReceived(roomId: $roomId) {
            id
            senderName
            content
            createdAt
        }
    }
`;

const ExamChat = ({ roomId, senderName, sendMessage }) => {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const scrollRef = useRef(null);

    useSubscription(EXAM_MESSAGE_SUBSCRIPTION, {
        variables: { roomId },
        onData: ({ data }) => {
            const newMessage = data.data.examMessageReceived;
            setMessages((prev) => [...prev, newMessage]);
        },
    });

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        try {
            await sendMessage({
                variables: {
                    roomId,
                    content: message,
                    senderName,
                },
            });
            setMessage("");
        } catch (err) {
            console.error("Error sending message:", err);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#0B111B]/50 rounded-3xl border border-white/10 overflow-hidden">
            <div className="p-4 border-b border-white/10 bg-white/5 flex items-center">
                <Edit3 className="w-5 h-5 mr-3 text-brand-indigo" />
                <span className="font-semibold text-white">Exam Live Support</span>
            </div>
            
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-accent-muted opacity-50">
                        <BookOpen className="w-12 h-12 mb-2" />
                        <p className="text-sm">Start a conversation with the {senderName.includes("Student") ? "Tutor" : "Student"}</p>
                    </div>
                )}
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex flex-col ${msg.senderName === senderName ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                            msg.senderName === senderName 
                            ? 'bg-brand-indigo text-white rounded-tr-none' 
                            : 'bg-white/10 text-accent-secondary rounded-tl-none border border-white/5'
                        }`}>
                            <div className="text-[10px] font-bold uppercase tracking-wider opacity-60 mb-1">
                                {msg.senderName}
                            </div>
                            {msg.content}
                        </div>
                    </div>
                ))}
            </div>

            <form onSubmit={handleSend} className="p-4 bg-white/5 border-t border-white/10 flex items-end space-x-2">
                <textarea
                    value={message}
                    onChange={(e) => {
                        setMessage(e.target.value);
                        e.target.style.height = 'auto';
                        e.target.style.height = `${e.target.scrollHeight}px`;
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSend(e);
                        }
                    }}
                    placeholder="Type a message..."
                    rows={1}
                    className="flex-1 bg-[#080C14]/50 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-brand-indigo transition-colors resize-none max-h-32 custom-scrollbar"
                />
                <button
                    type="submit"
                    className="p-2 bg-brand-indigo text-white rounded-xl hover:bg-brand-indigo/90 transition-colors shadow-lg shadow-brand-indigo/20 mb-0.5"
                >
                    <Send className="w-5 h-5" />
                </button>
            </form>
        </div>
    );
};

const Exam = () => {
    const { roomId } = useParams();
    const [examStarted, setExamStarted] = useState(false);
    const [warnings, setWarnings] = useState(0);
    const [examSubmitted, setExamSubmitted] = useState(false);
    const [warningMessage, setWarningMessage] = useState("");
    const [securityData, setSecurityData] = useState({ ip: "Fetching...", device: "" });
    const jitsiContainerRef = useRef(null);
    const jitsiApiRef = useRef(null);
    const { user, isAuthenticated } = useAuthStore();
    
    const [sendMessage] = useMutation(SEND_EXAM_MESSAGE);
    
    const role = isAuthenticated ? 'TUTOR' : 'STUDENT';
    const senderName = user ? `${user.firstName} ${user.lastName}` : "Student";
    

    useEffect(() => {
        // Fetch IP configuration and format device string
        fetch('https://api.ipify.org?format=json')
            .then(response => response.json())
            .then(data => {
                const userAgent = navigator.userAgent;
                let browser = "Unknown Browser";
                if (userAgent.indexOf("Firefox") > -1) browser = "Firefox";
                else if (userAgent.indexOf("Opera") > -1 || userAgent.indexOf("OPR") > -1) browser = "Opera";
                else if (userAgent.indexOf("Trident") > -1) browser = "Internet Explorer";
                else if (userAgent.indexOf("Edge") > -1) browser = "Edge";
                else if (userAgent.indexOf("Chrome") > -1) browser = "Chrome";
                else if (userAgent.indexOf("Safari") > -1) browser = "Safari";

                let os = "Unknown OS";
                if (userAgent.indexOf("Win") > -1) os = "Windows";
                else if (userAgent.indexOf("Mac") > -1) os = "MacOS";
                else if (userAgent.indexOf("X11") > -1) os = "UNIX";
                else if (userAgent.indexOf("Linux") > -1) os = "Linux";

                setSecurityData({
                    ip: data.ip,
                    device: `${browser} on ${os}`
                });
            })
            .catch(() => setSecurityData({ ip: "Unknown", device: navigator.platform }));
    }, []);

    // Auto-submit exam logic
    const handleAutoSubmit = useCallback(async (reason) => {
        setExamSubmitted(true);
        setWarningMessage(`Exam submitted: ${reason}`);

        // Notify tutor via chat
        try {
            await sendMessage({
                variables: {
                    roomId,
                    content: `❗ SYSTEM ALERT: Student's exam was auto-submitted. Reason: ${reason}`,
                    senderName: "SYSTEM PROCTOR"
                }
            });
        } catch (err) {
            console.error("Failed to send proctoring alert:", err);
        }

        // Safely attempt to exit fullscreen
        try {
            if (document.fullscreenElement && document.exitFullscreen) {
                document.exitFullscreen().catch(err => console.error("Error exiting fullscreen:", err));
            }
        } catch (e) {
            console.error(e);
        }

        // Cleanup jitsi
        if (jitsiApiRef.current) {
            jitsiApiRef.current.dispose();
            jitsiApiRef.current = null;
        }
    }, []);

    // Add a warning
    const addWarning = useCallback(async (reason) => {
        setWarnings((prev) => {
            const newWarnings = prev + 1;
            setWarningMessage(`Warning ${newWarnings}/${MAX_WARNINGS}: ${reason}`);
            
            // Notify chat room of violation
            sendMessage({
                variables: {
                    roomId,
                    content: `⚠️ PROCTOR WARNING (${newWarnings}/${MAX_WARNINGS}): ${reason}`,
                    senderName: "SYSTEM PROCTOR"
                }
            }).catch(err => console.error("Failed to send warning alert:", err));

            if (newWarnings >= MAX_WARNINGS) {
                handleAutoSubmit("Maximum warnings exceeded. Auto-submitted.");
            }

            // hide warning after 5s
            setTimeout(() => setWarningMessage(""), 5000);
            return newWarnings;
        });
    }, [handleAutoSubmit, sendMessage, roomId]);

    // Event Listeners for Anti-Cheat (Student only)
    useEffect(() => {
        if (!examStarted || examSubmitted || role === 'TUTOR') return;

        // 1. Tab Switching Detection
        const handleVisibilityChange = () => {
            if (document.hidden) {
                addWarning("Tab switching or minimizing is not allowed.");
            }
        };

        // 2. Fullscreen Exit Detection
        const handleFullscreenChange = () => {
            if (!document.fullscreenElement) {
                addWarning("Exiting fullscreen is not allowed.");
                // We can force them back into fullscreen if we wanted to
            }
        };

        // 3. Disable Right-click
        const handleContextMenu = (e) => {
            e.preventDefault();
            // addWarning("Right-click is restricted.");
        };

        // 4. Disable Copy, Paste, Cut
        const handleCopyPaste = (e) => {
            e.preventDefault();
            // addWarning("Copy/Paste actions are restricted.");
        };

        // 5. Disable Keyboard Shortcuts (F12, Ctrl+C, Ctrl+V, etc.)
        const handleKeyDown = (e) => {
            // Prevent F12
            if (e.key === 'F12') {
                e.preventDefault();
                addWarning("Developer tools are restricted.");
            }

            // Prevent Ctrl+Shift+I (DevTools)
            if (e.ctrlKey && e.shiftKey && e.key === 'I') {
                e.preventDefault();
                addWarning("Developer tools are restricted.");
            }

            // Prevent Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+P, Ctrl+S
            if (e.ctrlKey && ['c', 'v', 'x', 'p', 's'].includes(e.key.toLowerCase())) {
                e.preventDefault();
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        document.addEventListener("fullscreenchange", handleFullscreenChange);
        document.addEventListener("contextmenu", handleContextMenu);
        document.addEventListener("copy", handleCopyPaste);
        document.addEventListener("cut", handleCopyPaste);
        document.addEventListener("paste", handleCopyPaste);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            document.removeEventListener("fullscreenchange", handleFullscreenChange);
            document.removeEventListener("contextmenu", handleContextMenu);
            document.removeEventListener("copy", handleCopyPaste);
            document.removeEventListener("cut", handleCopyPaste);
            document.removeEventListener("paste", handleCopyPaste);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [examStarted, examSubmitted, addWarning]);

    // Jitsi Meeting Implementation
    useEffect(() => {
        if (examStarted && !examSubmitted && !jitsiApiRef.current) {
            const loadJitsiScript = () => {
                if (window.JitsiMeetExternalAPI) {
                    startMeeting();
                    return;
                }

                const script = document.createElement("script");
                script.src = "https://meet.jit.si/external_api.js";
                script.async = true;
                script.onload = startMeeting;
                document.body.appendChild(script);
            };

            const startMeeting = () => {
                if (!jitsiContainerRef.current) return;

                const domain = "meet.jit.si";
                const options = {
                    roomName: roomId || "fidel-ai-proctoring",
                    width: "100%",
                    height: "100%",
                    parentNode: jitsiContainerRef.current,
                    userInfo: {
                        displayName: "Your Name",
                    },
                };

                const api = new window.JitsiMeetExternalAPI(domain, options);
                jitsiApiRef.current = api;
                
                // Set initial display name
                api.executeCommand("displayName", `${senderName}`);
            };

            loadJitsiScript();
        }
    }, [examStarted, examSubmitted]);

    // Live update Jitsi display name so tutors see cheating telemetry natively in Jitsi
    useEffect(() => {
        if (jitsiApiRef.current && securityData.ip !== "Fetching..." && role === 'STUDENT') {
            jitsiApiRef.current.executeCommand(
                "displayName",
                `Student [Warn: ${warnings}/3] IP: ${securityData.ip}`
            );
        }
    }, [securityData.ip, warnings, role]);

    const startExam = () => {
        if (role === 'TUTOR') {
            return setExamStarted(true);            
        }

        const elem = document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen().then(() => {
                setExamStarted(true);
            }).catch((err) => {
                alert("Error attempting to enable fullscreen mode: " + err.message);
            });
        } else {
            // Fallback for browsers that don't support requestFullscreen properly
            setExamStarted(true);
        }
    };

    const manualSubmit = () => {
        handleAutoSubmit("User manually submitted the exam.");
    };

    if (examSubmitted) {
        return (
            <div className="min-h-screen bg-[#080C14] flex items-center justify-center p-6 text-white font-sans">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-premium rounded-3xl border border-white/10 p-12 max-w-lg w-full text-center shadow-2xl relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand-green/10 rounded-full blur-[100px] pointer-events-none" />
                    <div className="w-20 h-20 bg-brand-green/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-brand-green/20 relative z-10 shadow-[0_0_20px_rgba(0,200,83,0.2)]">
                        <CheckCircle className="w-10 h-10 text-brand-green" />
                    </div>
                    <h2 className="text-3xl font-black text-white mb-4 relative z-10">Exam Completed</h2>
                    <p className="text-accent-secondary mb-8 relative z-10">{warningMessage || "Your exam has been submitted successfully."}</p>
                    <button
                        onClick={() => window.location.href = "/"}
                        className="px-8 py-3 bg-brand-indigo text-white font-bold rounded-xl hover:bg-brand-indigo/90 transition-colors w-full relative z-10 shadow-lg"
                    >
                        Return to Home
                    </button>
                </motion.div>
            </div>
        );
    }

    if (!examStarted) {
        return (
            <div className="min-h-screen bg-[#080C14] flex items-center justify-center p-6 text-white font-sans">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-premium rounded-3xl border border-white/10 p-10 max-w-2xl w-full text-center shadow-2xl relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand-indigo/10 rounded-full blur-[100px] pointer-events-none" />

                    <h1 className="text-3xl font-black text-white mb-6">Secure Exam Environment</h1>

                    <div className="bg-[#0B111B]/80 rounded-2xl p-6 border border-white/5 text-left mb-8 space-y-4 shadow-inner">
                        <h3 className="font-semibold text-lg text-brand-yellow flex items-center">
                            <ShieldAlert className="w-5 h-5 mr-3" />
                            Important Rules & Guidelines
                        </h3>
                        <ul className="text-accent-secondary space-y-2 text-sm pl-8 list-disc">
                            <li>You must remain in <strong>Fullscreen Mode</strong> throughout the exam.</li>
                            <li><strong>Do not switch tabs, minimize the browser, or open other applications.</strong></li>
                            <li>Right-click, copy, paste, and keyboard shortcuts have been disabled.</li>
                            {role === 'STUDENT' && <li>Your webcam and microphone will be recorded via our proctoring system.</li>}
                            {role === 'STUDENT' && <li>Violating these rules will result in a warning. After {MAX_WARNINGS} warnings, your exam will be automatically submitted.</li>}
                            {role === 'TUTOR' && <li>As a tutor, you have unrestricted access to assist the student.</li>}
                        </ul>
                    </div>

                    <button
                        onClick={startExam}
                        className="px-10 py-4 bg-brand-yellow text-black font-black uppercase tracking-wider rounded-xl hover:bg-brand-yellow/90 transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(255,193,7,0.3)] flex items-center mx-auto"
                    >
                        <Maximize className="w-5 h-5 mr-2" />
                        Enter Fullscreen & Start Exam
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#080C14] text-white flex flex-col font-sans select-none">
            {/* Top Header */}
            <header className="glass-premium border-b border-white/10 px-6 py-4 flex justify-between items-center z-50 shadow-md">
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 bg-[#0B111B]/50 px-3 py-1.5 rounded-lg border border-white/5">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                        <span className="font-bold tracking-widest text-xs tracking-wider text-red-50">RECORDING</span>
                    </div>
                    <div className="h-6 w-px bg-white/10"></div>
                    <h1 className="font-semibold text-accent-secondary">Fidel AI Assessment</h1>
                </div>

                <div className="flex items-center space-x-6">
                    <div className="px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg flex items-center font-medium shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                        <ShieldAlert className="w-4 h-4 mr-2" />
                        {role === 'STUDENT' ? `Warnings: ${warnings} / ${MAX_WARNINGS}` : `Monitoring Room`}
                    </div>
                    <button
                        onClick={manualSubmit}
                        className="px-6 py-2 bg-brand-green/20 text-brand-green border border-brand-green/30 hover:bg-brand-green/30 rounded-xl font-semibold transition-colors shadow-lg shadow-brand-green/10"
                    >
                        Submit Exam
                    </button>
                </div>
            </header>

            {/* Warning Toast */}
            <AnimatePresence>
                {warningMessage && !examSubmitted && (
                    <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        className="fixed top-24 left-1/2 transform -translate-x-1/2 z-[100] px-6 py-4 bg-red-500/90 backdrop-blur-md text-white font-bold rounded-2xl shadow-2xl flex items-center border border-red-400/50"
                    >
                        <AlertCircle className="w-6 h-6 mr-3 text-red-100" />
                        {warningMessage}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content Area */}
            <div className="flex-1 flex overflow-hidden">
                {/* Exam & Chat Split Panel */}
                <div className="flex-[3] flex overflow-hidden p-6 gap-6 relative wrapper-scrollbar">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-brand-indigo/5 rounded-full blur-[120px] pointer-events-none" />

                    {/* Chat Section (Left) */}
                    <div className="flex-1 flex flex-col min-w-[350px] relative z-20">
                        <ExamChat roomId={roomId} senderName={senderName} sendMessage={sendMessage} />
                    </div>

                    {/* Video Section (Right) */}
                    <div className="flex-[1.5] flex flex-col relative z-20">
                        <div className="bg-[#0B111B]/80 border border-white/10 rounded-3xl shadow-xl overflow-hidden flex flex-col h-full">
                            <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
                                <div className="flex items-center text-white font-semibold flex-1">
                                    <Video className="w-5 h-5 mr-3 text-brand-indigo" />
                                    Exam Live Stream
                                </div>
                                <span className="flex items-center text-xs text-green-400 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
                                    <span className="w-2 h-2 rounded-full bg-green-400 mr-2 animate-pulse" />
                                    Live Connection
                                </span>
                            </div>
                            <div className="bg-black flex-1 relative">
                                {!examStarted && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-accent-muted z-10">
                                        <Video className="w-16 h-16 mb-4 opacity-50" />
                                        <p>Video feed will appear here when exam starts.</p>
                                    </div>
                                )}
                                <div ref={jitsiContainerRef} className="w-full h-full relative z-20" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Security Sidebar */}
                <div className="w-80 bg-[#0B111B]/90 border-l border-white/10 flex flex-col shadow-2xl relative z-20">
                    <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="font-bold text-white tracking-wider flex items-center">
                                <ShieldAlert className="w-5 h-5 mr-2 text-brand-red" />
                                Security Info
                            </h3>
                            <div className="px-3 py-1 bg-brand-green/10 rounded-lg border border-brand-green/20 text-brand-green text-xs font-bold uppercase tracking-widest animate-pulse">
                                Active
                            </div>
                        </div>

                        <div className="p-4 bg-white/5 border border-white/10 rounded-2xl mb-8 backdrop-blur-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/10 rounded-full blur-[20px] pointer-events-none" />
                            <h4 className="font-semibold text-white flex items-center text-sm mb-4">
                                <AlertCircle className="w-4 h-4 mr-2" />
                                Warning System
                            </h4>
                            <div className="flex items-center space-x-2">
                                {[...Array(MAX_WARNINGS)].map((_, i) => (
                                    <div
                                        key={i}
                                        className={`flex-1 h-3 rounded-full transition-all duration-500 ${i < warnings ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-white/10'
                                            }`}
                                    />
                                ))}
                            </div>
                            <p className="text-xs text-accent-muted mt-4">
                                Max {MAX_WARNINGS} warnings allowed before auto-submission.
                            </p>
                        </div>

                        <h4 className="font-semibold mb-4 text-white">Automated Checks</h4>
                        <ul className="space-y-4 text-sm text-accent-secondary flex-1">
                            <li className="flex items-center justify-between text-white bg-white/5 p-3 rounded-xl border border-white/10">
                                <span className="flex items-center"><ShieldAlert className="w-4 h-4 mr-2 text-brand-indigo" /> IP Address</span>
                                <span className="font-mono text-xs text-brand-indigo">{securityData.ip}</span>
                            </li>
                            <li className="flex items-center justify-between text-white bg-white/5 p-3 rounded-xl border border-white/10">
                                <span className="flex items-center"><ShieldAlert className="w-4 h-4 mr-2 text-brand-indigo" /> Device Trace</span>
                                <span className="font-mono text-xs text-brand-indigo truncate max-w-[120px]" title={securityData.device}>{securityData.device}</span>
                            </li>
                            <li className="flex items-center text-green-400 bg-green-500/10 p-3 rounded-xl border border-green-500/20">
                                <CheckCircle className="w-5 h-5 mr-3" />
                                Fullscreen Active
                            </li>
                            <li className="flex items-center text-green-400 bg-green-500/10 p-3 rounded-xl border border-green-500/20">
                                <CheckCircle className="w-5 h-5 mr-3" />
                                Tab Focused
                            </li>
                            <li className={`flex items-center p-3 rounded-xl border ${warnings === 0 ? 'text-green-400 bg-green-500/10 border-green-500/20' : 'text-red-400 bg-red-500/10 border-red-500/20'}`}>
                                {warnings === 0 ? <CheckCircle className="w-5 h-5 mr-3" /> : <AlertCircle className="w-5 h-5 mr-3" />}
                                Trust Score: {warnings === 0 ? 'Optimal' : 'Compromised'}
                            </li>
                        </ul>

                        <div className="pt-6 border-t border-white/10 text-xs text-accent-muted text-center mt-auto font-medium tracking-wide">
                            Secure online proctoring system
                            <br />
                            Powered by Fidel AI Platform
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Exam;
