import './App.css';
import { initializeApp } from 'firebase/app';
import Home from './modules/home/Home.js';

const firebaseConfig = {
  apiKey: "AIzaSyA7PPm1mpebQxM3BR2PjqX3XKT15d2x_o0",
  authDomain: "iot-firebase-a0460.firebaseapp.com",
  databaseURL: "https://iot-firebase-a0460-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "iot-firebase-a0460",
  storageBucket: "iot-firebase-a0460.appspot.com",
  messagingSenderId: "129107080006",
  appId: "1:129107080006:web:17f0b909e7466ab50beb47"
}

function App() {
  return (
    <Home></Home>
    );
  }

const firebaseApp = initializeApp(firebaseConfig);
  
export default App;
