import axios from "axios";
import { store } from "../store/store"; 
import { refreshToken, logout } from "../store/authSlice";

// Axios 인스턴스 생성
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, 
});

// Axios 응답 인터셉터 추가
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.error("❌ API 요청 실패:", error.response);

    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; 

      try {
        console.log("🔄 JWT 만료 → Redux를 통해 토큰 갱신 요청");
        
        const resultAction = await store.dispatch(refreshToken());

        if (refreshToken.fulfilled.match(resultAction)) {
          console.log("새 토큰 발급 완료");

          return api(originalRequest);
        } else {
          console.error("❌ 토큰 갱신 실패 → 로그아웃 처리");
          store.dispatch(logout());
        }
      } catch (refreshError) {
        console.error("❌ 토큰 갱신 실패:", refreshError);
        store.dispatch(logout());
      }
    }

    return Promise.reject(error);
  }
);

export default api;
