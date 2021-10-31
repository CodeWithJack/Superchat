import './App.css';
import React, { useState, useEffect, useRef } from 'react';

import { initializeApp } from 'firebase/app'
import { collection, getFirestore, query, orderBy, limit, getDocs, addDoc, serverTimestamp  } from 'firebase/firestore'
import { getAuth, GoogleAuthProvider, signInWithPopup }  from 'firebase/auth'
import { getAnalytics, setUserProperties }  from 'firebase/analytics'

import { useAuthState } from 'react-firebase-hooks/auth'

const firebaseApp = initializeApp({
  apiKey: "AIzaSyBrIP2npL4AjFgpJUMOd7LtAxkNKXHpcsE",
  authDomain: "superchat-98290.firebaseapp.com",
  projectId: "superchat-98290",
  storageBucket: "superchat-98290.appspot.com",
  messagingSenderId: "556461207598",
  appId: "1:556461207598:web:a5b5506a5dd36c5a426fbf",
  measurementId: "G-DVT2PW5YDF"
});
// eslint-disable-next-line
const analytics = getAnalytics(firebaseApp);
const auth = getAuth(firebaseApp);
const firestore = getFirestore(firebaseApp);

function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header className="App-header">
        { user ? <SignOut /> : <></>}
      </header>
      <section>
        { user ? <ChatRoom /> : <SignIn /> }
      </section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider);
  }
  return (
    <button onClick={signInWithGoogle} className="sign-in">Sign in with Google</button>
  )
}
// eslint-disable-next-line
function SignOut() {
  return auth.currentUser && (
    <button onClick={() => auth.signOut()}>Sign Out</button>
  )
}

function ChatRoom() {  
  const dummy = useRef();
  const [messages, setMessages] = useState([]);
  const messagesRef = collection(firestore, 'messages');
  const q = query(messagesRef, orderBy('createdOn'), limit(25));
  
  useEffect(() => {
    const getMessages = async () => {
      const data = await getDocs(q);
      setMessages(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    };

    getMessages();
  });

  const [formValue, setFormValue] = useState('');

  const sendMessage = async(e) => {
    e.preventDefault();

    const {uid, photoURL} = auth.currentUser;
    await addDoc(messagesRef, {
      text: formValue,
      createdOn: serverTimestamp(),
      uid,
      photoURL
    });

    setFormValue('');

    dummy.current.scrollIntoView({ behavior: 'smooth'});
  };

  return (
    <>
      <main>
        {messages && messages.map(msg => <ChatMessage message={msg} key={msg.id}/>)}
        <div ref={dummy}></div>
      </main>

      <form onSubmit={sendMessage}>
        <input value={formValue} onChange={(e) => setFormValue(e.target.value)} />
        <button type="submit">📲</button>
      </form>
    </>
  )

  //return (<p>'It works'</p>)
}

// eslint-disable-next-line
function ChatMessage(props){
  // eslint-disable-next-line
  const { text,  uid, photoURL } = props.message;
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';


  return (
    <div className={`message ${messageClass}`}>
      <img src={photoURL}></img>
      <p>{text}</p>
    </div>
  )
}

export default App;
