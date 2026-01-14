import axios from "axios";

// IP 10.0.2.2 là localhost của máy ảo Android Studio
const BASE_URL = 'http://10.0.2.2:8000/';

export const endpoints = {
    'categories': '/categories/',
    'materials': '/materials/', 
    'login': '/o/token/',
    'current_user': '/users/current-user/',
    'register': '/users/',
    'material-details': (id) => `/materials/${id}/`,
    'material-comments': (id) => `/materials/${id}/reviews/`,
    'material-buy': (id) => `/materials/${id}/buy/`,
    'material-compare': '/materials/compare/' 
};

// --- DÁN MÃ CỦA BẠN VÀO 2 DÒNG DƯỚI ---
export const CLIENT_ID = '6NncBfrrThWVHNwvx4Ne5Zvy197VLWX766U8mw6X';
export const CLIENT_SECRET = 'pbkdf2_sha256$1200000$8Z1ypJvELVObmjQzylUL9g$h2pgYqN4b5yEalUoDoUqFIe7xjazPZMG6q4eGWSd6B4=';

export const authApis = (token) => {
    return axios.create({
        baseURL: BASE_URL,
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
};

export default axios.create({
    baseURL: BASE_URL
});