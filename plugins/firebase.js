import firebase from 'firebase'

var firebaseConfig = {
  apiKey: "AIzaSyAXuOGCj1e3BZEe0JaeNnAdiPSW7G1aKvg",
  authDomain: "shogi-e8f6e.firebaseapp.com",
  databaseURL: "https://shogi-e8f6e.firebaseio.com",
  projectId: "shogi-e8f6e",
  storageBucket: "shogi-e8f6e.appspot.com",
  messagingSenderId: "486011881275",
  appId: "1:486011881275:web:195b7804fb6886fa93d91e"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
export default firebase
