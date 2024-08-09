import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminSessions = () => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const res = await axios.get('http://localhost:3001/admin/sessions', {
                    headers: {
                        Authorization: localStorage.getItem('token'),
                    },
                });

                setSessions(res.data);
            } catch (error) {
                setError('Failed to fetch active sessions');
            } finally {
                setLoading(false);
            }
        };

        fetchSessions();
    }, []);

    const handleLogout = async (sessionId) => {
        try {
            await axios.post(
                'http://localhost:3001/admin/logout-user',
                { sessionId },
                {
                    headers: {
                        Authorization: localStorage.getItem('token'),
                    },
                }
            );

            setSessions(sessions.filter((session) => session.sessionId !== sessionId));
            alert('User has been logged out.');
        } catch (error) {
            alert('Failed to log out user.');
        }
    };

    if (loading) return <p>Loading sessions...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div>
            <h2>Active Sessions</h2>
            <table>
                <thead>
                    <tr>
                        <th>User ID</th>
                        <th>Login Time</th>
                        <th>Status</th>
                        <th>Session ID</th>
                        <th>IP Address</th>
                        <th>Device Info</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {sessions.map((session) => (
                        <tr key={session._id}>
                            <td>{session.userId}</td>
                            <td>{new Date(session.loginTime).toLocaleString()}</td>
                            <td>{session.status}</td>
                            {/* <td>{session.sessionId}</td> */}
                            <td>{'session.sessionId'}</td>
                            <td>{session.ipAddress}</td>
                            <td>{session.deviceInfo}</td>
                            <td>
                                <button onClick={() => handleLogout(session.sessionId)}>
                                    Log Out
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminSessions;
