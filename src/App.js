import React from 'react';
import logo from './logo.svg';
import './App.css';
import TopBar from './components/TopBar';
import Profile from './components/Profile';
import Footer from './components/Footer';

class App extends React.Component  {
    render() {
        return (
            <div className="App">
                <TopBar />
                <Profile />
                <Footer />
            </div>
        );
    }

}

export default App;
