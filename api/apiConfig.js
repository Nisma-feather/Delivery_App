import axios from "axios";


export const api = axios.create({
  baseURL: "http://192.168.1.9:8000/api",
});

//http://192.168.1.14:8000/api
//https://food-delivery-backend-qk0w.onrender.com/api
