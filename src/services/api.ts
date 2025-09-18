import axios, { AxiosRequestConfig } from "axios";

const API_BASE = "http://localhost:3000"; // 👉 ถ้า production ค่อยเปลี่ยนทีเดียว

// รวม endpoint ไว้ที่นี่
export const API = {
  //auth
  REGISTER: `${API_BASE}/api/auth/register`,
  VERIFY_OTP_REGISTER: `${API_BASE}/api/auth/verify-otp-register`,
  LOGIN: `${API_BASE}/api/auth/login`,
  LOGOUT: `${API_BASE}/api/auth/logout`,
  RESET_PASSWORD: `${API_BASE}/api/auth/reset-password`,
  VERIFY_OTP_RESET_PASSWORD: `${API_BASE}/api/auth/verify-otp-reset-password`,
  NEW_PASSWORD: `${API_BASE}/api/auth/new_password`,

  USER_ROLE: `${API_BASE}/api/get-role`,

  
  GET_PROPERTY: `${API_BASE}/api/properties`,


  POST_PROPERTY: `${API_BASE}/api/properties`,
  PUT_PROPERTY: `${API_BASE}/api/properties`,
  DELETE_PROPERTY: `${API_BASE}/api/properties`,
  TYPE_PROPERTY: `${API_BASE}/api/get_type_property`,
  STATUS_PROPERTY: `${API_BASE}/api/get_status_property`,
  REVIEW_PROPERTY: `${API_BASE}/api/tenant/review`,
  FAVORITE_PROPERTY: `${API_BASE}/api/tenant/favorite`,
};

// instance ของ axios (ใส่ interceptor ได้ด้วย)
export const apiClient = axios.create({
  baseURL: API_BASE,
});

// ฟังก์ชันที่เรียก API จริง ๆ
export const AuthService = {
  login: (data: { email_phone: string; password: string }) =>
    apiClient.post(API.LOGIN, data),

  register: (data: { email_phone: string }) =>
    apiClient.post(API.REGISTER, data),

  reset_password: (data: { email_phone: string }) =>
    apiClient.post(API.RESET_PASSWORD, data),

  verify_otp_reset_password: (data: { email_phone: string; otp: string }) =>
    apiClient.post(API.VERIFY_OTP_RESET_PASSWORD, data),

  new_password: (data: { password: string }) =>
    apiClient.post(API.NEW_PASSWORD, data),

  verify_otp_register: (data: {
    first_name: string;
    last_name: string;
    email_phone: string;
    password: string;
    role: number;
    otp: string;
  }) => apiClient.post(API.VERIFY_OTP_REGISTER, data),

  logout: () => apiClient.post(API.LOGOUT),
};

export const GetEnumDB = {
  role: () => apiClient.get(API.USER_ROLE),
  type_property: (config: AxiosRequestConfig = {}) =>
    apiClient.get(API.TYPE_PROPERTY, config),
  status_property: (config: AxiosRequestConfig = {}) =>
    apiClient.get(API.STATUS_PROPERTY, config),
};

export const manager_property = {
  get_property: (config: AxiosRequestConfig = {}) =>
    apiClient.get(API.GET_PROPERTY, config),
  post_property: (data: FormData, config: AxiosRequestConfig = {}) =>
    apiClient.post(API.GET_PROPERTY, data, config),
  put_property: (data: FormData, config: AxiosRequestConfig = {}) =>
    apiClient.put(API.GET_PROPERTY, data, config),
  delete_property: (config: AxiosRequestConfig = {}) =>
    apiClient.delete(API.GET_PROPERTY, config),

  get_review_property: (config: AxiosRequestConfig = {}) =>
    apiClient.get(API.REVIEW_PROPERTY, config),
  post_review_property: (
    data: { score: number; comment: string },
    config: AxiosRequestConfig = {}
  ) => apiClient.post(API.REVIEW_PROPERTY, data, config),
  put_review_property: (
    data: { score: number; comment: string },
    config: AxiosRequestConfig = {}
  ) => apiClient.put(API.REVIEW_PROPERTY, data, config),
  delete_review_property: (config: AxiosRequestConfig = {}) =>
    apiClient.delete(API.REVIEW_PROPERTY, config),

  get_favorite_property: (config: AxiosRequestConfig = {}) =>
    apiClient.get(API.FAVORITE_PROPERTY, config),
};
