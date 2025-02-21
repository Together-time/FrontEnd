"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProjectList from "@/components/projectList/projectList";
import ProjectInformation from "@/components/projectInformation/projectInformation";
import Schedule from "@/components/projectSchedule/projectSchedule";
import KakaoLogin from "./images/kakaoLogin.png";
import Image from "next/image";
import axios from "axios";
import "@/app/page.css";

const Home: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 상태
  const [isCheckingLogin, setIsCheckingLogin] = useState(true); // 로그인 상태 확인 중 여부
  //사용자 정보
  const [user, setUser] = useState<{ nickname: string; email: string; online: boolean } | null>(null);
  const router = useRouter();

  // 카카오 로그인 URL 생성
  const KAKAO_AUTH_URL = `${process.env.NEXT_PUBLIC_API_URL}/oauth2/authorization/kakao`;


  // 로그인 상태 확인
  useEffect(() => {
    const loginAttempted = sessionStorage.getItem("loginAttempted");
  
    if (loginAttempted === "true") {
      axios
        .get(`${process.env.NEXT_PUBLIC_API_URL}/api/member/user`, {
          withCredentials: true,
        })
        .then((response) => {
          console.log("📌 API 응답 데이터:", response.data);
  
          let userInfo;
  
          if (typeof response.data === "string") {
            userInfo = { name: response.data };
          } else if (response.data && typeof response.data === "object" && response.data.name) {
            userInfo = { name: response.data.name };
          } else {
            console.warn("⚠ 예상치 못한 응답 형식:", response.data);
            userInfo = { name: "알 수 없음" };
          }
  
          // localStorage에 저장
          localStorage.setItem("userInfo", JSON.stringify(userInfo));
  
          setIsLoggedIn(true);
        })
        .catch((error) => {
          console.error("❌ 사용자 정보 요청 실패:", error.response?.data || error.message);
          setIsLoggedIn(false);
        })
        .finally(() => {
          sessionStorage.removeItem("loginAttempted");
          setIsCheckingLogin(false);
        });
    } else {
      sessionStorage.removeItem("loginAttempted");
      setIsLoggedIn(false);
      setIsCheckingLogin(false);
    }
  }, []);
  


  // 카카오 로그인 핸들러
  const handleKakaoLogin = () => {
    console.log("카카오 로그인 시도...");
    sessionStorage.setItem("loginAttempted", "true"); // 로그인 시도 상태 저장
    window.location.href = KAKAO_AUTH_URL; 
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
            onClick={handleKakaoLogin}
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
