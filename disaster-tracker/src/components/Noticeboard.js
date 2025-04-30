import React, { useState, useEffect } from 'react';
import { auth, firestore } from '../firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';

const Noticeboard = () => {
  const [notices, setNotices] = useState([]);
  const [newNotice, setNewNotice] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  // Real-time notices listener
  useEffect(() => {
    const q = query(
      collection(firestore, "notices"),
      orderBy("createdAt", "desc")
    );
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const noticesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setNotices(noticesData);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newNotice.trim() || !auth.currentUser) return;

    setIsPosting(true);
    try {
      await addDoc(collection(firestore, "notices"), {
        text: newNotice,
        createdAt: serverTimestamp(),
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email
      });
      setNewNotice(''); // Clear the input after successful post
    } catch (error) {
      console.error("Error adding notice:", error);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div style={{ 
      padding: '100px 20px 40px',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <h1 style={{ marginBottom: '30px' }}>Community Noticeboard</h1>
      
      {/* Post Submission Form */}
      {auth.currentUser && (
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '30px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ marginBottom: '15px', fontSize: '1.2rem' }}>Post a New Notice</h2>
          <form onSubmit={handleSubmit}>
            <textarea
              value={newNotice}
              onChange={(e) => setNewNotice(e.target.value)}
              placeholder="Share important updates, alerts, or information with the community..."
              style={{
                width: '100%',
                minHeight: '120px',
                padding: '12px',
                marginBottom: '15px',
                borderRadius: '6px',
                border: '1px solid #ced4da',
                fontSize: '1rem',
                resize: 'vertical'
              }}
              required
            />
            <button 
              type="submit" 
              disabled={isPosting}
              style={{
                padding: '10px 20px',
                backgroundColor: isPosting ? '#6c757d' : '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '1rem',
                transition: 'background-color 0.2s'
              }}
            >
              {isPosting ? 'Posting...' : 'Publish Notice'}
            </button>
          </form>
        </div>
      )}

      {/* Notices Listing Section */}
      <div>
        <h2 style={{ 
          marginBottom: '20px',
          paddingBottom: '10px',
          borderBottom: '2px solid #e9ecef'
        }}>
          Community Notices ({notices.length})
        </h2>
        
        {notices.length === 0 ? (
          <p style={{ 
            textAlign: 'center', 
            color: '#6c757d',
            padding: '20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '6px'
          }}>
            No notices yet. Be the first to post!
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {notices.map(notice => (
              <div key={notice.id} style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                borderLeft: '4px solid #28a745'
              }}>
                <p style={{ 
                  fontSize: '1.1rem',
                  marginBottom: '15px',
                  whiteSpace: 'pre-wrap',
                  lineHeight: '1.6'
                }}>
                  {notice.text}
                </p>
                <div style={{ 
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.9rem',
                  color: '#6c757d',
                  borderTop: '1px solid #e9ecef',
                  paddingTop: '10px'
                }}>
                  <span>Posted by: {notice.userEmail || 'Anonymous'}</span>
                  <span>
                    {notice.createdAt?.toDate 
                      ? notice.createdAt.toDate().toLocaleString([], {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) 
                      : 'Just now'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Noticeboard;