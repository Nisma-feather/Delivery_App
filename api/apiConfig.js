import axios from "axios";


export const api = axios.create({
  baseURL: "https://food-delivery-backend-qk0w.onrender.com/api",
});

//http://192.168.1.14:8000/api
//https://food-delivery-backend-qk0w.onrender.com/api