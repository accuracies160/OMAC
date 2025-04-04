import React, { useState } from 'react';
import { auth, firestore } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

const AuthButtons = () => {
  const [showModal, setShowModal] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [notificationPrefs, setNotificationPrefs] = useState({
    earthquakes: true,
    hurricanes: true,
    wildfires: true
  });

  const handleAuth = async (e) => {
    e.preventDefault();
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
      alert(error.message);
    }
  };

  return (
    <div className="auth-buttons">
      {auth.currentUser ? (
        <button 
          className="auth-button"
          onClick={() => auth.signOut()}
        >
          Logout
        </button>
      ) : (
        <button 
          className="auth-button"
          onClick={() => setShowModal(true)}
        >
          Login/Signup
        </button>
      )}

      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            width: '300px',
            position: 'relative'
          }}>
            <button 
              onClick={() => setShowModal(false)}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'none',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                padding: '0 5px'
              }}
            >
              ×
            </button>

            <h3 style={{ marginTop: '10px', paddingRight: '20px' }}>
              {isLogin ? 'Login' : 'Sign Up'}
            </h3>
            
            <form onSubmit={handleAuth}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', margin: '8px 0', padding: '8px' }}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', margin: '8px 0', padding: '8px' }}
                required
              />
              
              {!isLogin && (
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px' }}>Notification Preferences</label>
                  <label style={{ display: 'block' }}>
                    <input
                      type="checkbox"
                      checked={notificationPrefs.earthquakes}
                      onChange={() => setNotificationPrefs({
                        ...notificationPrefs,
                        earthquakes: !notificationPrefs.earthquakes
                      })}
                    /> Earthquakes
                  </label>
                  <label style={{ display: 'block' }}>
                    <input
                      type="checkbox"
                      checked={notificationPrefs.hurricanes}
                      onChange={() => setNotificationPrefs({
                        ...notificationPrefs,
                        hurricanes: !notificationPrefs.hurricanes
                      })}
                    /> Hurricanes
                  </label>
                  <label style={{ display: 'block', marginBottom: '15px' }}>
                    <input
                      type="checkbox"
                      checked={notificationPrefs.wildfires}
                      onChange={() => setNotificationPrefs({
                        ...notificationPrefs,
                        wildfires: !notificationPrefs.wildfires
                      })}
                    /> Wildfires
                  </label>
                </div>
              )}
              
              <button 
                type="submit"
                style={{
                  width: '100%',
                  padding: '8px',
                  margin: '8px 0',
                  backgroundColor: '#4285f4',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px'
                }}
              >
                {isLogin ? 'Login' : 'Sign Up'}
              </button>
            </form>
            
            <button 
              onClick={() => setIsLogin(!isLogin)}
              style={{
                background: 'none',
                border: 'none',
                color: '#4285f4',
                cursor: 'pointer'
              }}
            >
              {isLogin ? 'Need an account? Sign up' : 'Already have an account? Login'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthButtons;
