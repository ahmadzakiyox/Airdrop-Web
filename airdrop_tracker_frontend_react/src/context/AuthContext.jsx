// airdrop_tracker_frontend_react/src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { loginUser as apiLoginUser, registerUser as apiRegisterUser, getUserProfile } from '../api/auth.js';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            const accessToken = localStorage.getItem('access_token');
            const refreshTokenStored = localStorage.getItem('refresh_token');

            if (accessToken) {
                try {
                    const decodedAccess = jwtDecode(accessToken);
                    if (decodedAccess.exp * 1000 > Date.now()) { // Cek akses token validitas
                        const userData = await getUserProfile();
                        setUser(userData);
                        setIsAuthenticated(true);
                    } else if (refreshTokenStored) { // Coba refresh jika akses token kedaluwarsa
                        try {
                            const refreshRes = await refreshTokenApi(refreshTokenStored);
                            localStorage.setItem('access_token', refreshRes.access);
                            localStorage.setItem('refresh_token', refreshRes.refresh);
                            const userData = await getUserProfile();
                            setUser(userData);
                            setIsAuthenticated(true);
                        } catch (refreshErr) { console.error("Failed to refresh token:", refreshErr); logout(); }
                    } else { logout(); }
                } catch (error) { console.error("Invalid access token:", error); logout(); }
            }
            setLoading(false);
        };
        loadUser();
    }, []);

    const loginUser = async (credentials) => {
        const data = await apiLoginUser(credentials);
        localStorage.setItem('access_token', data.token); // Sesuaikan jika nama field token beda (misal 'access')
        // Jika backend Node.js juga mengeluarkan refresh token, simpan
        // localStorage.setItem('refresh_token', data.refreshToken);
        const userData = await getUserProfile();
        setUser(userData);
        setIsAuthenticated(true);
        return data;
    };

    const registerUser = async (userData) => {
        const data = await apiRegisterUser(userData);
        return data;
    };

    const logout = () => {
        localStorage.clear();
        setUser(null);
        setIsAuthenticated(false);
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, loginUser, registerUser, logout, setUser, setIsAuthenticated, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);