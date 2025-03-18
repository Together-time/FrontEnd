"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProjectList from "@/components/projectList/projectList";
import ProjectInformation from "@/components/projectInformation/projectInformation";
import Schedule from "@/components/projectSchedule/projectSchedule";
import KakaoLogin from "./images/kakaoLogin.png";
import Image from "next/image";
import axios from "axios";
import { useAppDispatch, useAppSelector } from "@/app/store/store";
import { fetchUser, logout } from "@/app/store/authSlice";
import "@/app/page.css";

const Home: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  const [isCheckingLogin, setIsCheckingLogin] = useState(true);
  //사용자 정보
  const { isAuthenticated, loading, user } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const dispatch = useAppDispatch();

  // 카카오 로그인 URL 생성
  const KAKAO_AUTH_URL = `${process.env.NEXT_PUBLIC_API_URL}/oauth2/authorization/kakao`;


  // 로그인 상태 확인
  useEffect(() => {
    if (!sessionStorage.getItem("sessionInitialized")) {
      console.log("🗑 프로젝트 실행 - 로그인 정보 초기화");
      sessionStorage.setItem("sessionInitialized", "true");
      localStorage.removeItem("userInfo");
    }

    dispatch(fetchUser())
      .unwrap()
      .then((userData) => {
        if (userData) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      })
      .catch(() => {
        setIsLoggedIn(false);
      })
      .finally(() => {
        setIsCheckingLogin(false);
      });
  }, [dispatch]);
  

  // 로그아웃 기능 추가
  const handleLogout = async () => {
    try {
      const result = await dispatch(logout()).unwrap(); 
      if (result === true) { 
        localStorage.removeItem("userInfo");
        setIsLoggedIn(false);
      } else {
        console.warn("⚠ 로그아웃 실패: 예상치 못한 응답 값", result);
      }
    } catch (error) {
      console.error("❌ 로그아웃 요청 실패:", error);
    }
  };

  // 카카오 로그인 핸들러
  const handleKakaoLogin = () => {
    console.log("카카오 로그인 시도...");
    sessionStorage.setItem("loginAttempted", "true");
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
            <ProjectInformation handleLogout={handleLogout}/>
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
