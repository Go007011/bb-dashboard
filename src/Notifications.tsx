import { useState } from 'react';
import { GripVertical, Eye, CheckCircle, File as FileEdit, X } from 'lucide-react';

interface NotificationsProps {
  isDark: boolean;
}

interface NotificationRecord {
  id: number;
  notificationId: string;
  businessId: string;
  message: string;
  status: 'Answered' | 'Unanswered' | 'Open';
  date: string;
  note: string;
}

export default function Notifications({ isDark }: NotificationsProps) {
  const [records, setRecords] = useState<NotificationRecord[]>([
    { id: 1, notificationId: 'NTF-1021', businessId: 'Business-2044', message: 'Opportunity review request', status: 'Unanswered', date: 'Mar 11, 2026', note: '' },
    { id: 2, notificationId: 'NTF-1022', businessId: 'Business-2045', message: 'Capital commitment pending', status: 'Answered', date: 'Mar 10, 2026', note: 'Follow up completed' },
    { id: 3, notificationId: 'NTF-1023', businessId: 'Business-2046', message: 'Document verification required', status: 'Open', date: 'Mar 09, 2026', note: '' },
    { id: 4, notificationId: 'NTF-1024', businessId: 'Business-2047', message: 'Deal pipeline update', status: 'Unanswered', date: 'Mar 08, 2026', note: '' },
    { id: 5, notificationId: 'NTF-1025', businessId: 'Business-2048', message: 'Participation threshold reached', status: 'Answered', date: 'Mar 07, 2026', note: 'Confirmed with team' },
    { id: 6, notificationId: 'NTF-1026', businessId: 'Business-2049', message: 'Compliance check needed', status: 'Open', date: 'Mar 06, 2026', note: '' },
    { id: 7, notificationId: 'NTF-1027', businessId: 'Business-2050', message: 'New opportunity submitted', status: 'Unanswered', date: 'Mar 05, 2026', note: '' },
    { id: 8, notificationId: 'NTF-1028', businessId: 'Business-2051', message: 'Capital desk assignment', status: 'Answered', date: 'Mar 04, 2026', note: 'Assigned to John' },
    { id: 9, notificationId: 'NTF-1029', businessId: 'Business-2052', message: 'Risk assessment complete', status: 'Open', date: 'Mar 03, 2026', note: '' },
    { id: 10, notificationId: 'NTF-1030', businessId: 'Business-2053', message: 'Approval workflow initiated', status: 'Unanswered', date: 'Mar 02, 2026', note: '' }
  ]);

  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [noteModal, setNoteModal] = useState<{ isOpen: boolean; record: NotificationRecord | null }>({
    isOpen: false,
    record: null
  });
  const [currentNote, setCurrentNote] = useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Answered':
        return isDark ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-green-100 text-green-700 border border-green-200';
      case 'Unanswered':
        return isDark ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'bg-orange-100 text-orange-700 border border-orange-200';
      case 'Open':
        return isDark ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-blue-100 text-blue-700 border border-blue-200';
      default:
        return isDark ? 'bg-gray-500/20 text-gray-400 border border-gray-500/30' : 'bg-gray-100 text-gray-700 border border-gray-200';
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedItem(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();

    if (draggedItem === null || draggedItem === index) return;

    const newRecords = [...records];
    const draggedRecord = newRecords[draggedItem];
    newRecords.splice(draggedItem, 1);
    newRecords.splice(index, 0, draggedRecord);
    setRecords(newRecords);
    setDraggedItem(index);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const openNoteModal = (record: NotificationRecord) => {
    setNoteModal({ isOpen: true, record });
    setCurrentNote(record.note);
  };

  const closeNoteModal = () => {
    setNoteModal({ isOpen: false, record: null });
    setCurrentNote('');
  };

  const handleMarkAnswered = (id: number) => {
    console.log('Mark Answered clicked for ID:', id);
  };

  const handleView = (id: number) => {
    console.log('View clicked for ID:', id);
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Notifications
        </h2>
        <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          System alerts and messages
        </p>
      </div>

      <div className={`dashboard-card overflow-hidden ${!isDark && 'bg-white border-gray-200 shadow-sm'}`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${isDark ? 'border-gray-700 bg-[#0f172a]' : 'border-gray-200 bg-gray-50'}`}>
                <th className={`text-left p-4 font-semibold text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <div className="flex items-center gap-2">
                    <GripVertical size={16} className={isDark ? 'text-gray-600' : 'text-gray-400'} />
                  </div>
                </th>
                <th className={`text-left p-4 font-semibold text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Notification ID
                </th>
                <th className={`text-left p-4 font-semibold text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Business
                </th>
                <th className={`text-left p-4 font-semibold text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Message
                </th>
                <th className={`text-left p-4 font-semibold text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Status
                </th>
                <th className={`text-left p-4 font-semibold text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Date
                </th>
                <th className={`text-left p-4 font-semibold text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Note
                </th>
                <th className={`text-left p-4 font-semibold text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {records.map((record, index) => (
                <tr
                  key={record.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`border-b cursor-move transition-colors ${
                    isDark
                      ? 'border-gray-700 hover:bg-[#1e293b]'
                      : 'border-gray-100 hover:bg-gray-50'
                  } ${draggedItem === index ? 'opacity-50' : 'opacity-100'}`}
                >
                  <td className="p-4">
                    <GripVertical size={16} className={isDark ? 'text-gray-600' : 'text-gray-400'} />
                  </td>
                  <td className={`p-4 text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {record.notificationId}
                  </td>
                  <td className={`p-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {record.businessId}
                  </td>
                  <td className={`p-4 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {record.message}
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${getStatusColor(record.status)}`}>
                      {record.status}
                    </span>
                  </td>
                  <td className={`p-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {record.date}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => openNoteModal(record)}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                        isDark
                          ? 'bg-gray-500/10 text-gray-400 hover:bg-gray-500/20 border border-gray-500/30'
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      <FileEdit size={14} />
                      Open Note
                    </button>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleView(record.id)}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                          isDark
                            ? 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/30'
                            : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200'
                        }`}
                      >
                        <Eye size={14} />
                        View
                      </button>
                      <button
                        onClick={() => handleMarkAnswered(record.id)}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                          isDark
                            ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/30'
                            : 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-200'
                        }`}
                      >
                        <CheckCircle size={14} />
                        Mark Answered
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {noteModal.isOpen && noteModal.record && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={closeNoteModal}>
          <div
            className={`relative w-full max-w-md mx-4 rounded-lg shadow-xl ${
              isDark ? 'bg-[#1e293b] border border-gray-700' : 'bg-white border border-gray-200'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Note - {noteModal.record.notificationId}
              </h3>
              <button
                onClick={closeNoteModal}
                className={`p-1 rounded-lg transition-colors ${
                  isDark ? 'hover:bg-[#0f172a] text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4">
              <div className="mb-4">
                <p className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <span className="font-medium">Business:</span> {noteModal.record.businessId}
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <span className="font-medium">Message:</span> {noteModal.record.message}
                </p>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Note
                </label>
                <textarea
                  value={currentNote}
                  onChange={(e) => setCurrentNote(e.target.value)}
                  rows={6}
                  placeholder="Enter your note here..."
                  className={`w-full px-3 py-2 rounded-lg border text-sm resize-none ${
                    isDark
                      ? 'bg-[#0f172a] border-gray-700 text-gray-300 placeholder-gray-500 focus:border-blue-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                />
              </div>
            </div>

            <div className={`flex items-center justify-end gap-2 p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <button
                onClick={closeNoteModal}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isDark
                    ? 'bg-gray-500/10 text-gray-400 hover:bg-gray-500/20 border border-gray-500/30'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                }`}
              >
                Close
              </button>
              <button
                onClick={() => {
                  console.log('Note saved:', currentNote);
                  closeNoteModal();
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isDark
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
