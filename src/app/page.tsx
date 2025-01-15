"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProjectList from "@/components/projectList/projectList";
import ProjectInformation from "@/components/projectInformation/projectInformation";
import Schedule from "@/components/projectSchedule/projectSchedule";
import KakaoLogin from "./images/kakaoLogin.png";
import Image from "next/image";
import "@/app/page.css";

const Home: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 상태
  const [isCheckingLogin, setIsCheckingLogin] = useState(true); // 로그인 상태 확인 중 여부
  const router = useRouter();

  // 환경 변수
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const REDIRECT_URI = process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI;
  const CLIENT_ID = process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID;

  // 카카오 로그인 URL 생성
  const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code`;

  // 로그인 상태 확인
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const jwtToken = urlParams.get("token"); // URL에서 토큰 가져오기
    const loginAttempted = sessionStorage.getItem("loginAttempted");

    if (jwtToken && loginAttempted === "true") {
      // 사용자가 로그인 버튼을 클릭한 경우에만 처리
      localStorage.setItem("jwtToken", jwtToken); // JWT 토큰 저장

      setIsLoggedIn(true);

      // URL에서 토큰 제거
      window.history.replaceState({}, document.title, window.location.pathname);

      sessionStorage.removeItem("loginAttempted"); // 로그인 시도 상태 초기화
      setIsCheckingLogin(false);
    } else if (loginAttempted !== "true") {
      // 사용자가 로그인 버튼을 누르지 않은 경우
      sessionStorage.removeItem("loginAttempted"); // 초기화
      localStorage.removeItem("jwtToken"); // JWT 토큰 제거
      setIsLoggedIn(false);
      setIsCheckingLogin(false);
    }
  }, []);

  // 카카오 로그인 핸들러
  const handleKakaoLogin = () => {
    console.log("카카오 로그인 시도...");
    sessionStorage.setItem("loginAttempted", "true"); // 로그인 시도 상태 저장
    window.location.href = KAKAO_AUTH_URL; // 카카오 로그인 페이지로 리디렉션
  };

  // 로그인 상태 확인 중 로딩 화면 표시
  if (isCheckingLogin) {
    return <p>로그인 상태를 확인 중입니다...</p>;
  }

  return (
    <>
      {!isLoggedIn ? (
        <div className="loginOverlay">
          <Image
            src={KakaoLogin}
            alt="카카오 로그인"
            className="login-btn"
            onClick={handleKakaoLogin} // 로그인 버튼 클릭 핸들러
          />
        </div>
      ) : (
        <div className="container">
          <div className="left left-container">
            <ProjectList />
          </div>
          <div className="middle">
            <ProjectInformation />
          </div>
          <div className="right">
            <Schedule />
          </div>
        </div>
      )}
    </>
  );
};

export default Home;
