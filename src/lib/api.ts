import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
  // timeout: 3000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: "Bearer 2|lDBeH8E82vn804hbAcFKbMa5ZIOUbjilc8gp2sYd279e3110", // temporary
  },
});
