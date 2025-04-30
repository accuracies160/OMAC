import React, { useEffect } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { firestore } from './firebase';

const FirestoreTest = () => {
  const testConnection = async () => {
    try {
      const docRef = await addDoc(collection(firestore, "test"), {
        message: "Testing Firestore connection",
        timestamp: serverTimestamp()
      });
      console.log("Document written with ID: ", docRef.id);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <div>
      <h3>Firestore Connection Test</h3>
      <p>Check your browser console and Firestore database for test results.</p>
    </div>
  );
};

export default FirestoreTest;
