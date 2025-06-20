// airdrop_tracker_frontend_react/src/api/airdrops.js
import axios from './axiosConfig';

export const getAirdrops = async () => (await axios.get('/airdrops')).data;
export const getAirdropDetail = async (id) => (await axios.get(`/airdrops/${id}`)).data;
export const createAirdrop = async (airdropData) => {
    const formData = new FormData();
    for (const key in airdropData) {
        if (airdropData[key] !== undefined && airdropData[key] !== null) {
            if (key === 'screenshot' && airdropData[key] instanceof FileList && airdropData[key].length > 0) formData.append(key, airdropData[key][0]);
            else if (key === 'screenshot' && airdropData[key] instanceof File) formData.append(key, airdropData[key]);
            else formData.append(key, airdropData[key]);
        }
    }
    return (await axios.post('/airdrops', formData, { headers: { 'Content-Type': 'multipart/form-data' } })).data;
};
export const updateAirdrop = async (id, airdropData) => {
    const formData = new FormData();
    for (const key in airdropData) {
        if (airdropData[key] !== undefined && airdropData[key] !== null) {
            if (key === 'screenshot' && airdropData[key] instanceof FileList && airdropData[key].length > 0) formData.append(key, airdropData[key][0]);
            else if (key === 'screenshot' && airdropData[key] instanceof File) formData.append(key, airdropData[key]);
            else formData.append(key, airdropData[key]);
        }
    }
    return (await axios.put(`/airdrops/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })).data;
};
export const deleteAirdrop = async (id) => (await axios.delete(`/airdrops/${id}`)).data;
export const getAirdropStatusSummary = async () => (await axios.get('/airdrops/summary')).data;