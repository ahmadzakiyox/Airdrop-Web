// airdrop_tracker_frontend_react/src/api/auth.js
import axios from './axiosConfig';

export const registerUser = async (userData) => (await axios.post('/auth/register', userData)).data;
export const loginUser = async (credentials) => (await axios.post('/auth/login', credentials)).data;
export const verifyEmail = async (token, email) => (await axios.get(`/auth/verify-email?token=${token}&email=${email}`)).data;
export const getUserProfile = async () => (await axios.get('/auth/profile')).data;

export const updateUserProfile = async (userData) => {
    const formData = new FormData();
    for (const key in userData) {
        if (key === 'profilePicture' && userData[key] instanceof FileList && userData[key].length > 0) {
            formData.append(key, userData[key][0]); // Ambil file pertama dari FileList
        } else if (userData[key] !== undefined && userData[key] !== null) {
            formData.append(key, userData[key]);
        }
    }
    const response = await axios.put('/auth/profile', formData, { // Menggunakan PUT untuk update
        headers: {
            'Content-Type': 'multipart/form-data', // Penting untuk upload file
        },
    });
    return response.data;
};

export const googleLoginAuthCode = async (code) => {
    const response = await axios.post('/auth/google-login', { code });
    return response.data;
};