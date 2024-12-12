"use client"

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import ProjectList from "@/components/projectList/projectList";
import ProjectInformation from "@/components/projectInformation/projectInformation";
import Schedule from "@/components/projectSchedule/projectSchedule";
import KakaoLogin from "./images/kakaoLogin.png";
import Image from "next/image";
import '@/app/page.css';

const Home: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  // 환경 변수
  const API_URL = process.env.NEXT_PUBLIC_API_URL;  // 백엔드 주소 확인 필요
  const REDIRECT_URI = process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI;  // 리다이렉트 URI
  const CLIENT_ID = process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID;  // 카카오 클라이언트 ID

  // 카카오 로그인 URL 생성
  const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code`;

  // 로그인 상태 확인
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    // JWT 토큰 확인
    const jwtToken = localStorage.getItem("jwtToken");

    if (jwtToken) {
      setIsLoggedIn(true);
      console.log("JWT 토큰 확인:", jwtToken);
    } else if (code) {
      // 카카오 로그인 콜백 처리
      handleKakaoCallback(code);
    }
  }, []);

  // 카카오 로그인 콜백 처리
  const handleKakaoCallback = async (code: string) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/auth/kakao/callback`,
        { code }
      );

      const jwtToken = response.data.accessToken;  // 응답 필드명 확인 필요
      if (!jwtToken) {
        throw new Error("JWT 토큰이 반환되지 않았습니다.");
      }

      // JWT 토큰 저장
      localStorage.setItem("jwtToken", jwtToken);
      console.log("JWT 토큰 저장 성공:", jwtToken);

      setIsLoggedIn(true);

      // URL에서 쿼리 파라미터 제거
      window.history.replaceState({}, document.title, "/");
    } catch (error) {
      console.error("카카오 로그인 오류:", error);
      alert("로그인에 실패했습니다. 다시 시도해 주세요.");
    }
  };

  // 카카오 로그인 핸들러
  const handleKakaoLogin = () => {
    window.location.href = KAKAO_AUTH_URL;
  };

  return (
    <>
      {!isLoggedIn && (
        <div className="loginOverlay">
          <Image
            src={KakaoLogin}
            alt="카카오 로그인"
            className="login-btn"
            onClick={handleKakaoLogin}
          />
        </div>
      )}

      <div className={`container ${!isLoggedIn ? "blur-background" : ""}`}>
        <div className="left left-container">
          <ProjectList />
        </div>
        <div className="middle">
          <ProjectInformation />
        </div>
        <div className="right"></div>
      </div>
    </>
  );
};

export default Home;