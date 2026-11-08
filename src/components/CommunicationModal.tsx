import React, { useState, useRef } from 'react';
import {
  X,
  Send,
  MessageSquare,
  ShieldAlert,
  Paperclip,
  Image as ImageIcon,
  FileText,
  Flag,
  CheckCheck,
  AlertTriangle,
  Download,
} from 'lucide-react';
import { Project, User, MessageItem, ChatAttachment } from '../types';
import { store } from '../services/store';

interface CommunicationModalProps {
  projectId: string;
  currentUser: User;
  project?: Project;
  messages: MessageItem[];
  onClose: () => void;
}

export const CommunicationModal: React.FC<CommunicationModalProps> = ({
  projectId,
  currentUser,
  project,
  messages,
  onClose,
}) => {
  const [inputText, setInputText] = useState('');
  const [pendingAttachments, setPendingAttachments] = useState<ChatAttachment[]>([]);
  const [reportingMsgId, setReportingMsgId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState<'off_platform_payment' | 'inappropriate_content' | 'harassment' | 'spam'>('off_platform_payment');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const projectMessages = messages.filter(m => m.projectId === projectId);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isImage: boolean) => {
    setFileError(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB limit
    if (file.size > MAX_SIZE) {
      setFileError(`File exceeds the maximum 5MB size limit (${(file.size / (1024 * 1024)).toFixed(1)}MB).`);
      return;
    }

    const allowedTypes = isImage
      ? ['image/png', 'image/jpeg', 'image/webp', 'image/gif']
      : [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/zip',
          'text/plain',
          'application/json',
        ];

    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(zip|pdf|docx|doc|txt|json|png|jpg|jpeg|webp)$/i)) {
      setFileError('Unsupported file type. Please upload PDF, Word DOCX, ZIP, TXT, or images.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const attachment: ChatAttachment = {
        name: file.name,
        sizeBytes: file.size,
        type: file.type || (isImage ? 'image/png' : 'application/octet-stream'),
        url: (reader.result as string) || '#',
        isImage,
      };
      setPendingAttachments(prev => [...prev, attachment]);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const removePendingAttachment = (index: number) => {
    setPendingAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && pendingAttachments.length === 0) return;

    store.sendMessage(
      projectId,
      currentUser.uid,
      currentUser.fullName,
      currentUser.accountType,
      inputText.trim(),
      pendingAttachments
    );

    setInputText('');
    setPendingAttachments([]);
    setFileError(null);
  };

  const submitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingMsgId) return;

    store.reportMessage({
      reportedByUid: currentUser.uid,
      reportedByName: currentUser.fullName,
      reportedTargetType: 'message',
      targetId: reportingMsgId,
      projectId,
      reason: reportReason,
      details: reportDetails || 'Reported via project workspace conversation.',
    });

    setReportSuccess(true);
    setTimeout(() => {
      setReportingMsgId(null);
      setReportSuccess(false);
      setReportDetails('');
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#101726] border border-slate-700 w-full max-w-3xl rounded-2xl h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center shrink-0 border border-teal-500/20">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold font-heading text-white truncate max-w-xs sm:max-w-md">
                  {project?.title || 'Project Workspace Chat'}
                </h3>
                {project && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-teal-300 border border-teal-500/30 shrink-0">
                    {project.status.replace('_', ' ').toUpperCase()}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 truncate">
                Direct Project Communication &bull; Escrow Protected Workspace
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close Chat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mandatory Payment Safety Notice Banner */}
        <div className="px-4 py-2.5 bg-amber-950/40 border-b border-amber-500/30 flex items-start gap-2.5 text-[11px] text-amber-200/95 shrink-0">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="leading-snug">
            <strong className="text-amber-300 font-semibold">Payment Safety Warning: </strong>
            For your safety and protection, always keep communications and payments on TrustTech. Transactions completed outside TrustTech are not protected by our escrow system or customer support. Failure to comply may lead to account suspension.
          </div>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {projectMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 text-xs space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-400">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-300">Direct Project Chat</p>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  Coordinate deliverables, review technical architecture, and share documents directly inside this encrypted conversation.
                </p>
              </div>
            </div>
          ) : (
            projectMessages.map(msg => {
              const isMe = msg.senderUid === currentUser.uid;

              return (
                <div
                  key={msg.id}
                  className={`group flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-2 mb-1 text-[11px] text-slate-400">
                    <span className="font-semibold text-slate-300">{msg.senderName}</span>
                    <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      {msg.senderRole}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {!isMe && (
                      <button
                        onClick={() => setReportingMsgId(msg.id)}
                        className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-opacity p-0.5"
                        title="Report inappropriate message or off-platform solicitation"
                      >
                        <Flag className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  <div
                    className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                      isMe
                        ? 'bg-teal-500 text-slate-950 font-medium rounded-tr-none'
                        : 'bg-slate-800 text-slate-200 border border-slate-700/80 rounded-tl-none'
                    } ${msg.reported ? 'ring-2 ring-red-500/50' : ''}`}
                  >
                    {msg.reported && (
                      <div className="flex items-center gap-1 text-[10px] font-mono text-red-300 mb-1">
                        <AlertTriangle className="w-3 h-3" /> Reported for review
                      </div>
                    )}

                    {msg.text && <p className="whitespace-pre-wrap break-words">{msg.text}</p>}

                    {/* Attachments inside message bubble */}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="mt-2 space-y-1.5 pt-1 border-t border-black/10">
                        {msg.attachments.map((att, idx) => (
                          <div key={idx}>
                            {att.isImage ? (
                              <div className="rounded-lg overflow-hidden border border-black/20 my-1 max-w-xs">
                                <img
                                  src={att.url}
                                  alt={att.name}
                                  className="max-h-48 w-full object-cover"
                                />
                                <div className="p-1.5 bg-black/40 text-[10px] truncate text-white flex justify-between items-center">
                                  <span className="truncate">{att.name}</span>
                                  <span className="opacity-75">{(att.sizeBytes / 1024).toFixed(0)} KB</span>
                                </div>
                              </div>
                            ) : (
                              <a
                                href={att.url}
                                download={att.name}
                                className={`flex items-center gap-2 p-2 rounded-lg text-[11px] font-medium transition-colors ${
                                  isMe
                                    ? 'bg-teal-600/30 text-slate-950 hover:bg-teal-600/50'
                                    : 'bg-slate-900/60 text-slate-200 hover:bg-slate-900'
                                }`}
                              >
                                <FileText className="w-4 h-4 shrink-0 text-teal-400" />
                                <span className="truncate flex-1">{att.name}</span>
                                <span className="text-[10px] opacity-75 shrink-0">
                                  {(att.sizeBytes / 1024).toFixed(0)} KB
                                </span>
                                <Download className="w-3.5 h-3.5 shrink-0 opacity-70" />
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Read receipts */}
                  {isMe && (
                    <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-0.5">
                      <CheckCheck className={`w-3.5 h-3.5 ${msg.read ? 'text-teal-400' : 'text-slate-500'}`} />
                      <span>{msg.read ? 'Read' : 'Delivered'}</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* File upload feedback error */}
        {fileError && (
          <div className="px-4 py-1.5 bg-red-950/50 border-t border-red-500/30 text-red-300 text-[11px] flex items-center justify-between">
            <span>{fileError}</span>
            <button onClick={() => setFileError(null)} className="text-red-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Pending attachments preview */}
        {pendingAttachments.length > 0 && (
          <div className="px-4 py-2 bg-slate-900/80 border-t border-slate-800 flex flex-wrap gap-2">
            {pendingAttachments.map((att, idx) => (
              <div
                key={idx}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200"
              >
                {att.isImage ? <ImageIcon className="w-3.5 h-3.5 text-teal-400" /> : <FileText className="w-3.5 h-3.5 text-teal-400" />}
                <span className="max-w-[140px] truncate">{att.name}</span>
                <span className="text-[10px] text-slate-400">({(att.sizeBytes / 1024).toFixed(0)} KB)</span>
                <button
                  type="button"
                  onClick={() => removePendingAttachment(idx)}
                  className="text-slate-400 hover:text-red-400 ml-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 sm:p-4 border-t border-slate-800 bg-slate-900/90 rounded-b-2xl">
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={e => handleFileUpload(e, false)}
              className="hidden"
              accept=".pdf,.doc,.docx,.zip,.txt,.json"
            />
            <input
              type="file"
              ref={imageInputRef}
              onChange={e => handleFileUpload(e, true)}
              className="hidden"
              accept="image/png,image/jpeg,image/webp,image/gif"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0 border border-slate-700"
              title="Attach document or ZIP (Max 5MB)"
            >
              <Paperclip className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0 border border-slate-700"
              title="Attach image (Max 5MB)"
            >
              <ImageIcon className="w-4 h-4" />
            </button>

            <input
              type="text"
              placeholder="Type message, deliverable update, or clarification..."
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-teal-500"
            />

            <button
              type="submit"
              disabled={!inputText.trim() && pendingAttachments.length === 0}
              className="px-4 py-2.5 bg-teal-500 hover:bg-teal-400 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </div>
          <div className="mt-1.5 flex justify-between items-center text-[10px] text-slate-500 px-1">
            <span>Supports PDF, DOCX, ZIP, TXT, PNG, JPG (up to 5MB)</span>
            <span className="text-teal-400 font-mono">100% In-Platform Protection</span>
          </div>
        </form>

        {/* Inappropriate Message Report Dialog */}
        {reportingMsgId && (
          <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4">
            <div className="bg-[#121824] border border-slate-700 rounded-xl p-5 max-w-md w-full shadow-2xl animate-in zoom-in-95">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Flag className="w-4 h-4 text-red-400" /> Report Message to Moderation
                </h4>
                <button
                  onClick={() => setReportingMsgId(null)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {reportSuccess ? (
                <div className="p-4 bg-teal-950/60 border border-teal-500/40 rounded-lg text-teal-300 text-xs text-center">
                  Report logged successfully. TrustTech Trust & Safety team will review within 24 hours.
                </div>
              ) : (
                <form onSubmit={submitReport} className="space-y-3">
                  <p className="text-xs text-slate-300">
                    TrustTech enforces strict safety policies against off-platform payment attempts, fraud, and abusive conduct.
                  </p>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Reason for Report
                    </label>
                    <select
                      value={reportReason}
                      onChange={e => setReportReason(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                    >
                      <option value="off_platform_payment">Off-platform payment solicitation (circumventing escrow)</option>
                      <option value="inappropriate_content">Inappropriate or prohibited content</option>
                      <option value="harassment">Harassment or abusive language</option>
                      <option value="spam">Spam or repetitive advertising</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Additional Details (Optional)
                    </label>
                    <textarea
                      rows={3}
                      value={reportDetails}
                      onChange={e => setReportDetails(e.target.value)}
                      placeholder="Explain what occurred..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setReportingMsgId(null)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold"
                    >
                      Submit Report
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
