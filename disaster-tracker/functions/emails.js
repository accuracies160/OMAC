const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

admin.initializeApp();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'andrew20169@gmail.com',
    pass: 'ajp573618'
  }
});

exports.sendDisasterNotification = functions.firestore
  .document('notifications/{notificationId}')
  .onCreate(async (snapshot, context) => {
    const notification = snapshot.data();
    const usersSnapshot = await admin.firestore().collection('users').get();
    
    usersSnapshot.forEach(async (userDoc) => {
      const user = userDoc.data();
      if (user.notificationPrefs[notification.type]) {
        await transporter.sendMail({
          from: '"Disaster Tracker" <your-email@gmail.com>',
          to: user.email,
          subject: `New ${notification.type} Alert`,
          text: `A new ${notification.type} has been detected: ${notification.details}`
        });
      }
    });
  });
