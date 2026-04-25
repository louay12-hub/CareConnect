import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const Contact = () => {
  const [contacts, setContacts] = useState([]);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [replyTitle, setReplyTitle] = useState("");
  const [replyMessage, setReplyMessage] = useState("");
  const [repliedIds, setRepliedIds] = useState(() => {
    // Load replied IDs from localStorage on initial render
    const saved = localStorage.getItem("repliedIds");
    return saved ? JSON.parse(saved) : [];
  });

  const apiURL = "http://localhost:5000/api";

  // Fetch all contact messages
  const fetchContacts = async () => {
    try {
      const res = await fetch(`${apiURL}/contact`);
      if (!res.ok) throw new Error("Failed to fetch contacts");
      const data = await res.json();
      setContacts(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch contact messages");
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const openReplyModal = (contact) => {
    setSelectedContact(contact);
    setReplyTitle("");
    setReplyMessage("");
    setShowReplyModal(true);
  };

  // Send reply and create notification
  const sendReply = async () => {
    if (!replyTitle || !replyMessage) {
      toast.error("Please enter title and message");
      return;
    }

    try {
      const res = await fetch(`${apiURL}/notifications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: selectedContact.user_id,
          title: replyTitle,
          message: replyMessage,
        }),
      });

      if (!res.ok) throw new Error("Failed to send reply");

      toast.success(`Reply sent to ${selectedContact.full_name}`);

      // Add to replied IDs and save to localStorage
      const updatedRepliedIds = [...repliedIds, selectedContact.id];
      setRepliedIds(updatedRepliedIds);
      localStorage.setItem("repliedIds", JSON.stringify(updatedRepliedIds));

      setShowReplyModal(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to send reply");
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md w-full">
      <Toaster position="top-right" />
      <h2 className="text-xl font-semibold mb-4">Contact Messages</h2>
      <div className="overflow-x-auto w-full border border-gray-200 rounded">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 border-b text-left">Full Name</th>
              <th className="py-2 px-4 border-b text-left">Email</th>
              <th className="py-2 px-4 border-b text-left">Subject</th>
              <th className="py-2 px-4 border-b text-left">Message</th>
              <th className="py-2 px-4 border-b text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {contacts.length > 0 ? (
              contacts.map((contact) => (
                <tr key={contact.id || contact.messageId} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{contact.full_name}</td>
                  <td className="py-2 px-4 border-b">{contact.email}</td>
                  <td className="py-2 px-4 border-b">{contact.subject}</td>
                  <td className="py-2 px-4 border-b">{contact.message}</td>
                  <td className="py-2 px-4 border-b">
                    {repliedIds.includes(contact.id) ? (
                      <span className="text-green-600 font-semibold">Replied</span>
                    ) : (
                      <button
                        onClick={() => openReplyModal(contact)}
                        className="px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600"
                      >
                        Reply
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-4 text-gray-500">
                  No messages found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Reply Modal */}
      {showReplyModal && selectedContact && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg w-96 p-6 relative">
            <button
              onClick={() => setShowReplyModal(false)}
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-semibold mb-4">
              Reply to {selectedContact.full_name}
            </h3>
            <div className="flex flex-col gap-3">
              <input type="hidden" value={selectedContact.user_id} />

              <input
                type="text"
                value={selectedContact.full_name}
                disabled
                className="border px-3 py-2 rounded w-full bg-gray-100"
                placeholder="Reply To"
              />
              <input
                type="text"
                value={replyTitle}
                onChange={(e) => setReplyTitle(e.target.value)}
                placeholder="Title"
                className="border px-3 py-2 rounded w-full"
              />
              <textarea
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Type your reply here..."
                className="border px-3 py-2 rounded w-full h-32 resize-none"
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={() => setShowReplyModal(false)}
                  className="px-3 py-1 rounded bg-gray-300 hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={sendReply}
                  className="px-3 py-1 rounded bg-blue-500 text-white hover:bg-black"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contact;
