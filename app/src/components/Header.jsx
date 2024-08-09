import React from 'react';
import axios from 'axios';

const Header = () => {

const logout = async () => {
    const token = localStorage.getItem('token');

    if (!token) {
        console.error('No token found, user may not be logged in.');
        return;
    }

    try {
        await axios.post(
            'http://localhost:3001/logout',
            {},
            {
                headers: {
                    Authorization: token,
                },
            }
        );

        // Clear the token from localStorage
        localStorage.removeItem('token');

        alert('Logged out successfully');
        // Optionally redirect to the login page or home page
        window.location.href = '/login';
    } catch (error) {
        console.error('Logout failed:', error);
        alert('Logout failed, please try again.');
    }
};

    return (
        <header>
            <nav>
                <ul>
                    <li><a href="/">Home</a></li>
                    <li><a href="/profile">Profile</a></li>
                    <li><button onClick={logout}>Logout</button></li>
                </ul>
            </nav>
        </header>
    );
};

export default Header;
