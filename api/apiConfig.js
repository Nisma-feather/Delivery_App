import axios from "axios";



export const api = axios.create({
  baseURL: "http://192.168.86.5:8000/api",
});

//
//https://food-delivery-backend-qk0w.onrender.com/api
