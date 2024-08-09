import './App.css';
import {useState} from 'react'
import SignUp from "./components/SignUp"
import Login from './components/Login';
import Header from './components/Header';
import AdminSessions from './components/AdminSessions';

function App() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = ()=>{
    console.log(email , password);
  }

  return (
    <div className="App">
      <Header />
      <AdminSessions />
      <SignUp />
      <Login/>
    </div>
  );
}

export default App;
