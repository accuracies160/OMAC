import React, { useState, useEffect } from 'react';
import { auth, firestore } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { signOut, updateEmail, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { FiUser, FiMail, FiLogOut, FiLock, FiEye, FiEyeOff, FiX } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const AccountPage = () => {
  const [userData, setUserData] = useState(null);
  const [notificationPrefs, setNotificationPrefs] = useState({
    earthquakes: true,
    wildfires: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [emailForm, setEmailForm] = useState({
    newEmail: '',
    currentPassword: ''
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) {
        setLoading(true);
        try {
          const docRef = doc(firestore, 'users', auth.currentUser.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            setUserData(docSnap.data());
            setNotificationPrefs(docSnap.data().notificationPrefs || {
              earthquakes: true,
              wildfires: true
            });
          }
        } catch (err) {
          setError('Failed to load user data');
          console.error(err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserData();
  }, []);

  const updatePreferences = async () => {
    setLoading(true);
    setError('');
    try {
      await updateDoc(doc(firestore, 'users', auth.currentUser.uid), {
        notificationPrefs
      });
      setSuccess('Preferences updated successfully');
    } catch (error) {
      setError('Error updating preferences: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const user = auth.currentUser;
      const credential = EmailAuthProvider.credential(
        user.email,
        emailForm.currentPassword
      );
      
      await reauthenticateWithCredential(user, credential);
      await updateEmail(user, emailForm.newEmail);
      await updateDoc(doc(firestore, 'users', user.uid), {
        email: emailForm.newEmail
      });

      setUserData({ ...userData, email: emailForm.newEmail });
      setSuccess('Email updated successfully');
      setEmailForm({ newEmail: '', currentPassword: '' });
      setShowEmailModal(false);
    } catch (error) {
      setError('Error updating email: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("New passwords don't match");
      setLoading(false);
      return;
    }

    try {
      const user = auth.currentUser;
      const credential = EmailAuthProvider.credential(
        user.email,
        passwordForm.currentPassword
      );
      
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, passwordForm.newPassword);

      setSuccess('Password updated successfully');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowPasswordModal(false);
    } catch (error) {
      setError('Error updating password: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      padding: '100px 20px 40px',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <h1 style={{ marginBottom: '30px' }}>Account Management</h1>
      
      {loading && !userData ? (
        <p>Loading account information...</p>
      ) : userData ? (
        <>
          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '30px'
          }}>
            <h2 style={{ marginBottom: '20px' }}>Profile Information</h2>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: '#4299e1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '24px'
              }}>
                <FiUser />
              </div>
              <div>
                <h3 style={{ margin: '0 0 5px 0' }}>{userData.email}</h3>
                <p style={{ margin: 0, color: '#666' }}>Active User</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
              <button 
                onClick={() => setShowEmailModal(true)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#4299e1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <FiMail />
                Change Email
              </button>
              
              <button 
                onClick={() => setShowPasswordModal(true)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#38a169',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <FiLock />
                Change Password
              </button>
            </div>
          </div>

          {/* Email Change Modal */}
          {showEmailModal && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1000
            }}>
              <div style={{
                backgroundColor: 'white',
                padding: '25px',
                borderRadius: '8px',
                width: '100%',
                maxWidth: '500px',
                position: 'relative'
              }}>
                <button 
                  onClick={() => {
                    setShowEmailModal(false);
                    setEmailForm({ newEmail: '', currentPassword: '' });
                    setError('');
                  }}
                  style={{
                    position: 'absolute',
                    top: '15px',
                    right: '15px',
                    background: 'none',
                    border: 'none',
                    fontSize: '20px',
                    cursor: 'pointer',
                    color: '#666'
                  }}
                >
                  <FiX />
                </button>
                
                <h2 style={{ marginBottom: '20px' }}>Change Email Address</h2>
                
                <form onSubmit={handleEmailChange}>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                      New Email
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="email"
                        value={emailForm.newEmail}
                        onChange={(e) => setEmailForm({...emailForm, newEmail: e.target.value})}
                        required
                        style={{
                          width: '100%',
                          padding: '10px 15px',
                          borderRadius: '6px',
                          border: '1px solid #ddd',
                          fontSize: '16px',
                          paddingLeft: '40px'
                        }}
                      />
                      <FiMail style={{
                        position: 'absolute',
                        left: '15px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#666'
                      }} />
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                      Current Password
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        value={emailForm.currentPassword}
                        onChange={(e) => setEmailForm({...emailForm, currentPassword: e.target.value})}
                        required
                        style={{
                          width: '100%',
                          padding: '10px 15px',
                          borderRadius: '6px',
                          border: '1px solid #ddd',
                          fontSize: '16px',
                          paddingLeft: '40px'
                        }}
                      />
                      <FiLock style={{
                        position: 'absolute',
                        left: '15px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#666'
                      }} />
                      <button 
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        style={{
                          position: 'absolute',
                          right: '15px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#666'
                        }}
                      >
                        {showCurrentPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                  </div>
                  
                  {error && (
                    <div style={{ 
                      color: '#e53e3e',
                      marginBottom: '15px',
                      padding: '10px',
                      backgroundColor: '#fff5f5',
                      borderRadius: '6px'
                    }}>
                      {error}
                    </div>
                  )}
                  
                  <button 
                    type="submit"
                    disabled={loading}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#4299e1',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      width: '100%'
                    }}
                  >
                    {loading ? 'Updating...' : 'Update Email'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Password Change Modal */}
          {showPasswordModal && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1000
            }}>
              <div style={{
                backgroundColor: 'white',
                padding: '25px',
                borderRadius: '8px',
                width: '100%',
                maxWidth: '500px',
                position: 'relative'
              }}>
                <button 
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordForm({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: ''
                    });
                    setError('');
                  }}
                  style={{
                    position: 'absolute',
                    top: '15px',
                    right: '15px',
                    background: 'none',
                    border: 'none',
                    fontSize: '20px',
                    cursor: 'pointer',
                    color: '#666'
                  }}
                >
                  <FiX />
                </button>
                
                <h2 style={{ marginBottom: '20px' }}>Change Password</h2>
                
                <form onSubmit={handlePasswordChange}>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                      Current Password
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                        required
                        style={{
                          width: '100%',
                          padding: '10px 15px',
                          borderRadius: '6px',
                          border: '1px solid #ddd',
                          fontSize: '16px',
                          paddingLeft: '40px'
                        }}
                      />
                      <FiLock style={{
                        position: 'absolute',
                        left: '15px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#666'
                      }} />
                      <button 
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        style={{
                          position: 'absolute',
                          right: '15px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#666'
                        }}
                      >
                        {showCurrentPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                      New Password
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                        required
                        minLength="6"
                        style={{
                          width: '100%',
                          padding: '10px 15px',
                          borderRadius: '6px',
                          border: '1px solid #ddd',
                          fontSize: '16px',
                          paddingLeft: '40px'
                        }}
                      />
                      <FiLock style={{
                        position: 'absolute',
                        left: '15px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#666'
                      }} />
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                      Confirm New Password
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                        required
                        minLength="6"
                        style={{
                          width: '100%',
                          padding: '10px 15px',
                          borderRadius: '6px',
                          border: '1px solid #ddd',
                          fontSize: '16px',
                          paddingLeft: '40px'
                        }}
                      />
                      <FiLock style={{
                        position: 'absolute',
                        left: '15px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#666'
                      }} />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: 'absolute',
                          right: '15px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#666'
                        }}
                      >
                        {showPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                  </div>
                  
                  {error && (
                    <div style={{ 
                      color: '#e53e3e',
                      marginBottom: '15px',
                      padding: '10px',
                      backgroundColor: '#fff5f5',
                      borderRadius: '6px'
                    }}>
                      {error}
                    </div>
                  )}
                  
                  <button 
                    type="submit"
                    disabled={loading}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#38a169',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      width: '100%'
                    }}
                  >
                    {loading ? 'Updating...' : 'Update Password'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Notification Preferences Section */}
          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '30px'
          }}>
            <h2 style={{ marginBottom: '20px' }}>Notification Preferences</h2>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={notificationPrefs.earthquakes}
                  onChange={() => setNotificationPrefs({
                    ...notificationPrefs,
                    earthquakes: !notificationPrefs.earthquakes
                  })}
                  disabled={loading}
                />
                <span>Earthquake Alerts</span>
              </label>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={notificationPrefs.wildfires}
                  onChange={() => setNotificationPrefs({
                    ...notificationPrefs,
                    wildfires: !notificationPrefs.wildfires
                  })}
                  disabled={loading}
                />
                <span>Wildfire Alerts</span>
              </label>
            </div>
            
            <button 
              onClick={updatePreferences}
              disabled={loading}
              style={{
                padding: '10px 20px',
                backgroundColor: '#4299e1',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              {loading ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>

          <div style={{
            backgroundColor: '#fff5f5',
            padding: '20px',
            borderRadius: '8px'
          }}>
            <h2 style={{ marginBottom: '20px', color: '#e53e3e' }}>Account Actions</h2>
            <button 
              onClick={handleLogout}
              disabled={loading}
              style={{
                padding: '10px 20px',
                backgroundColor: '#e53e3e',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <FiLogOut />
              Logout
            </button>
          </div>
        </>
      ) : (
        <p>No user data available. Please sign in.</p>
      )}
      
      {error && !showEmailModal && !showPasswordModal && (
        <div style={{ 
          color: '#e53e3e',
          marginTop: '20px',
          padding: '10px',
          backgroundColor: '#fff5f5',
          borderRadius: '6px'
        }}>
          {error}
        </div>
      )}
      
      {success && (
        <div style={{ 
          color: '#38a169',
          marginTop: '20px',
          padding: '10px',
          backgroundColor: '#f0fff4',
          borderRadius: '6px'
        }}>
          {success}
        </div>
      )}
    </div>
  );
};

export default AccountPage;