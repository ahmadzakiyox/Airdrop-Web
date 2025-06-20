// src/utils/formatUtils.js
import { format as dateFnsFormat } from 'date-fns';

export const formatDate = (dateString, formatStr = 'dd MMM yyyy') => { // <<< PASTIKAN INI ADALAH 'yyyy' (huruf kecil)
    if (!dateString) return 'N/A';
    try {
        return dateFnsFormat(new Date(dateString), formatStr);
    } catch (error) {
        console.error("Error formatting date:", dateString, error);
        return 'Invalid Date';
    }
};

// Anda bisa menambahkan fungsi format lainnya di sini