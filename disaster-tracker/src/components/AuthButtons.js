import React, { useState, useEffect, useRef } from 'react';
import { auth, firestore } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { FiUser, FiLock, FiMail, FiX, FiChevronDown, FiCheck, FiLogOut } from 'react-icons/fi';

const AuthButtons = () => {
  const [showModal, setShowModal] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userData, setUserData] = useState(null);
  const [notificationPrefs, setNotificationPrefs] = useState({
    earthquakes: true,
    hurricanes: true,
    wildfires: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [inputWidth, setInputWidth] = useState(200);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const emailInputRef = useRef(null);

  // Calculate input width based on email content
  useEffect(() => {
    if (emailInputRef.current && email) {
      const tempSpan = document.createElement('span');
      tempSpan.style.visibility = 'hidden';
      tempSpan.style.whiteSpace = 'nowrap';
      tempSpan.style.fontSize = window.getComputedStyle(emailInputRef.current).fontSize;
      tempSpan.style.fontFamily = window.getComputedStyle(emailInputRef.current).fontFamily;
      tempSpan.style.padding = '0 10px';
      tempSpan.textContent = email || '';
      document.body.appendChild(tempSpan);
      
      const newWidth = Math.min(Math.max(tempSpan.offsetWidth + 40, 200), 350);
      setInputWidth(newWidth);
      document.body.removeChild(tempSpan);
    } else if (!email) {
      setInputWidth(200);
    }
  }, [email]);

  // Auth state listener
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          setLoading(true);
          const docRef = doc(firestore, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            setUserData(docSnap.data());
            setNotificationPrefs(docSnap.data().notificationPrefs || {
              earthquakes: true,
              hurricanes: true,
              wildfires: true
            });
          } else {
            await setDoc(docRef, {
              email: user.email,
              notificationPrefs: {
                earthquakes: true,
                hurricanes: true,
                wildfires: true
              }
            });
            setUserData({ email: user.email });
          }
        } catch (err) {
          setError('Failed to load user data');
          console.error(err);
        } finally {
          setLoading(false);
        }
      } else {
        setUserData(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(firestore, 'users', userCredential.user.uid), {
          email,
          notificationPrefs
        });
      }
      setShowModal(false);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setShowProfile(false);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async () => {
    setLoading(true);
    setError('');
    try {
      const user = auth.currentUser;
      if (user) {
        await updateDoc(doc(firestore, 'users', user.uid), {
          notificationPrefs
        });
      }
    } catch (error) {
      setError('Error updating preferences: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Auth Buttons - Top Right */}
      <div className="auth-container" style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        zIndex: 1000
      }}>
        {auth.currentUser ? (
          <div className="profile-container">
            <button 
              className="profile-button" 
              onClick={() => setShowProfile(!showProfile)}
              disabled={loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '6px',
                fontWeight: 500,
                transition: 'all 0.2s',
                border: '1px solid #e2e8f0',
                background: 'white',
                color: '#1a202c',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
              }}
            >
              <FiUser className="icon" style={{ color: '#4a5568' }} />
              <span>{loading ? 'Loading...' : (userData?.email || 'Profile')}</span>
              <FiChevronDown className={`dropdown-icon ${showProfile ? 'open' : ''}`} />
            </button>
            
            {showProfile && (
              <div className="profile-dropdown" style={{
                position: 'absolute',
                right: 0,
                top: '100%',
                marginTop: '8px',
                width: '280px',
                background: 'white',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                overflow: 'hidden',
                zIndex: 1100
              }}>
                <div className="profile-header" style={{
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  borderBottom: '1px solid #edf2f7'
                }}>
                  <div className="user-avatar" style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: '#4299e1',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <FiUser size={24} />
                  </div>
                  <div className="user-info">
                    <h4 style={{
                      margin: 0,
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#1a202c'
                    }}>
                      {userData?.email}
                    </h4>
                    <span className="user-status" style={{
                      fontSize: '12px',
                      color: '#718096'
                    }}>
                      Active
                    </span>
                  </div>
                </div>
                
                <div className="dropdown-section" style={{
                  padding: '16px',
                  borderBottom: '1px solid #edf2f7'
                }}>
                  <h5 className="section-title" style={{
                    margin: '0 0 12px 0',
                    fontSize: '13px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    color: '#718096'
                  }}>
                    Notification Preferences
                  </h5>
                  <div className="preference-list">
                    <label className="preference-item" style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 0',
                      cursor: 'pointer'
                    }}>
                      <div className="checkbox-container" style={{
                        position: 'relative',
                        width: '16px',
                        height: '16px'
                      }}>
                        <input
                          type="checkbox"
                          checked={notificationPrefs.earthquakes}
                          onChange={() => setNotificationPrefs({
                            ...notificationPrefs,
                            earthquakes: !notificationPrefs.earthquakes
                          })}
                          disabled={loading}
                          style={{
                            opacity: 0,
                            position: 'absolute'
                          }}
                        />
                        <span className="checkmark" style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '16px',
                          height: '16px',
                          border: '1px solid #cbd5e0',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'transparent',
                          transition: 'all 0.2s'
                        }}>
                          {notificationPrefs.earthquakes && <FiCheck size={12} />}
                        </span>
                      </div>
                      <span className="preference-label" style={{
                        fontSize: '14px',
                        color: '#2d3748'
                      }}>
                        Earthquakes
                      </span>
                    </label>
                    
                    <label className="preference-item" style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 0',
                      cursor: 'pointer'
                    }}>
                      <div className="checkbox-container" style={{
                        position: 'relative',
                        width: '16px',
                        height: '16px'
                      }}>
                        <input
                          type="checkbox"
                          checked={notificationPrefs.wildfires}
                          onChange={() => setNotificationPrefs({
                            ...notificationPrefs,
                            wildfires: !notificationPrefs.wildfires
                          })}
                          disabled={loading}
                          style={{
                            opacity: 0,
                            position: 'absolute'
                          }}
                        />
                        <span className="checkmark" style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '16px',
                          height: '16px',
                          border: '1px solid #cbd5e0',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'transparent',
                          transition: 'all 0.2s'
                        }}>
                          {notificationPrefs.wildfires && <FiCheck size={12} />}
                        </span>
                      </div>
                      <span className="preference-label" style={{
                        fontSize: '14px',
                        color: '#2d3748'
                      }}>
                        Wildfires
                      </span>
                    </label>
                  </div>
                  
                  <button 
                    className="dropdown-btn save-btn" 
                    onClick={updatePreferences}
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      fontWeight: 500,
                      marginTop: '12px',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      background: '#4299e1',
                      color: 'white',
                      border: 'none'
                    }}
                  >
                    {loading ? 'Saving...' : 'Save Preferences'}
                  </button>
                </div>
                
                <div className="dropdown-footer" style={{
                  padding: '8px'
                }}>
                  <button 
                    className="dropdown-btn logout-btn" 
                    onClick={handleLogout}
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      fontWeight: 500,
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      background: 'none',
                      border: '1px solid #e2e8f0',
                      color: '#e53e3e'
                    }}
                  >
                    <FiLogOut className="icon" />
                    {loading ? 'Logging out...' : 'Logout'}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button 
            className="login-button" 
            onClick={() => setShowModal(true)}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '6px',
              fontWeight: 500,
              transition: 'all 0.2s',
              border: '1px solid #e2e8f0',
              background: 'white',
              color: '#1a202c',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
            }}
          >
            <FiUser className="icon" style={{ color: '#4a5568' }} />
            <span>{loading ? 'Loading...' : 'Login'}</span>
          </button>
        )}

        {/* Login Modal */}
        {showModal && (
          <div className="modal-overlay" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000
          }}>
            <div className="auth-modal" style={{
              width: '100%',
              maxWidth: '400px',
              backgroundColor: 'white',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              animation: 'modalFadeIn 0.3s ease'
            }}>
              <button 
                className="close-modal" 
                onClick={() => setShowModal(false)}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'none',
                  border: 'none',
                  color: '#718096',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <FiX size={20} />
              </button>
              
              <div className="auth-header" style={{
                padding: '24px 24px 16px',
                textAlign: 'center'
              }}>
                <h3 style={{
                  margin: 0,
                  fontSize: '20px',
                  fontWeight: 600,
                  color: '#1a202c'
                }}>
                  {isLogin ? 'Welcome Back' : 'Create Account'}
                </h3>
                <p style={{
                  margin: '8px 0 0',
                  fontSize: '14px',
                  color: '#718096'
                }}>
                  {isLogin ? 'Sign in to continue' : 'Get started with your account'}
                </p>
              </div>
              
              {error && (
                <div className="auth-error" style={{
                  background: '#fff5f5',
                  color: '#e53e3e',
                  padding: '12px 24px',
                  fontSize: '14px',
                  borderBottom: '1px solid #fed7d7'
                }}>
                  <p>{error}</p>
                </div>
              )}
              
              <form className="auth-form" onSubmit={handleAuth} style={{
                padding: '24px'
              }}>
                <div className="form-group" style={{
                  marginBottom: '16px'
                }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#4a5568'
                  }}>
                    Email Address
                  </label>
                  <div 
                    className={`input-with-icon ${isInputFocused ? 'focused' : ''}`}
                    style={{ 
                      width: `${inputWidth}px`,
                      position: 'relative',
                      transition: 'width 0.3s ease',
                      margin: '0 auto'
                    }}
                  >
                    <FiMail className="input-icon" style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#a0aec0'
                    }} />
                    <input
                      ref={emailInputRef}
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setIsInputFocused(true)}
                      onBlur={() => setIsInputFocused(false)}
                      required
                      disabled={loading}
                      style={{ 
                        width: '100%',
                        padding: '10px 16px 10px 40px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        fontSize: '14px',
                        transition: 'all 0.2s'
                      }}
                    />
                  </div>
                </div>
                
                <div className="form-group" style={{
                  marginBottom: '16px'
                }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#4a5568'
                  }}>
                    Password
                  </label>
                  <div className="input-with-icon" style={{
                    position: 'relative'
                  }}>
                    <FiLock className="input-icon" style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#a0aec0'
                    }} />
                    <input
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                      style={{
                        width: '100%',
                        padding: '10px 16px 10px 40px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        fontSize: '14px',
                        transition: 'all 0.2s'
                      }}
                    />
                  </div>
                </div>
                
                {!isLogin && (
                  <div className="preferences-section" style={{
                    marginBottom: '16px'
                  }}>
                    <label className="section-label" style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#4a5568'
                    }}>
                      Notification Preferences
                    </label>
                    <div className="preference-grid" style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                      gap: '8px'
                    }}>
                      <label className="preference-option" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer'
                      }}>
                        <input
                          type="checkbox"
                          checked={notificationPrefs.earthquakes}
                          onChange={() => setNotificationPrefs({
                            ...notificationPrefs,
                            earthquakes: !notificationPrefs.earthquakes
                          })}
                          disabled={loading}
                          style={{
                            opacity: 0,
                            position: 'absolute'
                          }}
                        />
                        <span className="option-checkbox" style={{
                          width: '16px',
                          height: '16px',
                          border: '1px solid #cbd5e0',
                          borderRadius: '4px',
                          display: 'inline-block',
                          position: 'relative'
                        }}>
                          {notificationPrefs.earthquakes && (
                            <FiCheck size={12} style={{
                              position: 'absolute',
                              top: '50%',
                              left: '50%',
                              transform: 'translate(-50%, -50%)',
                              color: '#4299e1'
                            }} />
                          )}
                        </span>
                        <span className="option-label" style={{
                          fontSize: '14px'
                        }}>
                          Earthquakes
                        </span>
                      </label>
                      
                      <label className="preference-option" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer'
                      }}>
                        <input
                          type="checkbox"
                          checked={notificationPrefs.wildfires}
                          onChange={() => setNotificationPrefs({
                            ...notificationPrefs,
                            wildfires: !notificationPrefs.wildfires
                          })}
                          disabled={loading}
                          style={{
                            opacity: 0,
                            position: 'absolute'
                          }}
                        />
                        <span className="option-checkbox" style={{
                          width: '16px',
                          height: '16px',
                          border: '1px solid #cbd5e0',
                          borderRadius: '4px',
                          display: 'inline-block',
                          position: 'relative'
                        }}>
                          {notificationPrefs.wildfires && (
                            <FiCheck size={12} style={{
                              position: 'absolute',
                              top: '50%',
                              left: '50%',
                              transform: 'translate(-50%, -50%)',
                              color: '#4299e1'
                            }} />
                          )}
                        </span>
                        <span className="option-label" style={{
                          fontSize: '14px'
                        }}>
                          Wildfires
                        </span>
                      </label>
                    </div>
                  </div>
                )}
                
                <button 
                  type="submit" 
                  className="auth-submit-btn"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: '#4299e1',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: 500,
                    fontSize: '14px',
                    marginTop: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
                </button>
              </form>
              
              <div className="auth-footer" style={{
                padding: '16px 24px 24px',
                textAlign: 'center',
                fontSize: '14px',
                color: '#718096',
                borderTop: '1px solid #edf2f7'
              }}>
                <p>
                  {isLogin ? "Don't have an account?" : "Already have an account?"}
                  <button 
                    type="button" 
                    className="switch-mode-btn"
                    onClick={() => setIsLogin(!isLogin)}
                    disabled={loading}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#4299e1',
                      fontWeight: 500,
                      marginLeft: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    {isLogin ? 'Sign up' : 'Sign in'}
                  </button>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AuthButtons;