import React, { useState, useEffect, useRef } from 'react';
import { auth, firestore } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { FiUser, FiLock, FiMail, FiX, FiChevronDown, FiCheck, FiLogOut } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const AuthButtons = () => {
  const [showModal, setShowModal] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userData, setUserData] = useState(null);
  const [notificationPrefs, setNotificationPrefs] = useState({
    earthquakes: true,
    wildfires: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [inputWidth, setInputWidth] = useState(200);
  const emailInputRef = useRef(null);

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
              wildfires: true
            });
          } else {
            await setDoc(docRef, {
              email: user.email,
              notificationPrefs
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

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 1001
    }}>
      {auth.currentUser ? (
        <Link 
          to="/account"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '6px',
            backgroundColor: 'white',
            color: '#1a202c',
            textDecoration: 'none',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
          }}
        >
          <FiUser style={{ color: '#4a5568' }} />
          <span>{loading ? 'Loading...' : (userData?.email || 'Account')}</span>
        </Link>
      ) : (
        <button 
          onClick={() => setShowModal(true)}
          disabled={loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '6px',
            fontWeight: 500,
            border: '1px solid #e2e8f0',
            background: 'white',
            color: '#1a202c',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
            cursor: 'pointer'
          }}
        >
          <FiUser style={{ color: '#4a5568' }} />
          <span>{loading ? 'Loading...' : 'Login'}</span>
        </button>
      )}

      {/* Login Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            width: '100%',
            maxWidth: '400px',
            backgroundColor: 'white',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            margin: '0 20px'
          }}>
            <button 
              onClick={() => setShowModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                color: '#718096',
                cursor: 'pointer',
                padding: '4px',
                zIndex: 1
              }}
            >
              <FiX size={20} />
            </button>
            
            <div style={{
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
              <div style={{
                background: '#fff5f5',
                color: '#e53e3e',
                padding: '12px 24px',
                fontSize: '14px',
                borderBottom: '1px solid #fed7d7'
              }}>
                <p>{error}</p>
              </div>
            )}
            
            <form onSubmit={handleAuth} style={{
              padding: '24px'
            }}>
              <div style={{
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
                <div style={{ 
                  width: `${inputWidth}px`,
                  position: 'relative',
                  margin: '0 auto'
                }}>
                  <FiMail style={{
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
                    required
                    disabled={loading}
                    style={{ 
                      width: '100%',
                      padding: '10px 16px 10px 40px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>
              
              <div style={{
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
                <div style={{
                  position: 'relative'
                }}>
                  <FiLock style={{
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
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>
              
              <button 
                type="submit" 
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#4299e1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 500,
                  marginTop: '8px',
                  cursor: 'pointer'
                }}
              >
                {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
              </button>
            </form>
            
            <div style={{
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
  );
};

export default AuthButtons;