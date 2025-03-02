"use client"

import React, {useState, useEffect} from "react";
import { useRouter } from "next/navigation";
import styles from "./projectSchedule.module.css";
import Clock from "./clockSchedule";
import Chart from "./chartSchedule";
import { FiSearch } from "react-icons/fi";
import { SlOptions } from "react-icons/sl";
import { RootState } from "@/app/store/store";
import { useAppDispatch, useAppSelector } from '@/app/store/store';
import axios from "axios";
import { fetchProjectById } from '@/app/store/selectedProjectSlice';
import { logout, withdraw} from '@/app/store/authSlice';
import { fetchDeleteProject } from "@/app/store/projectSlice";

const ProjectSchedule: React.FC = () => {
    const router = useRouter();
    const [currentDate, setCurrentDate] = useState("");
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [showCalendar, setShowCalendar] = useState(false);
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
    const [isOpen, setIsOpen] = useState(false);
    const dispatch = useAppDispatch();

    // Redux에서 프로젝트 데이터 가져오기
    const { projects, loading, error } = useAppSelector((state) => state.project);
    //특정 프로젝트 데이터 불러오기
    const selectedProject = useAppSelector((state:RootState) => state.selectedProject.selectedProject);
    const [isPublic, setIsPublic] = useState(selectedProject?.status === "PUBLIC");
    const projectId = selectedProject?.id; 

    useEffect(() => {
      if (selectedProject) {
        setIsPublic(selectedProject.status === "PUBLIC");
      }
    }, [selectedProject]);

    const today = {
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        date: new Date().getDate(),
      };
    
      const week: string[] = ["일", "월", "화", "수", "목", "금", "토"]; // 요일 배열

    //날짜 형태 변환
    const formatDate = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2,"0");
        return `${year}.${month}.${day}`;
    };

    //스토리지 저장 형식
    const formatStorageDate = (date:Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0"); 
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`; 
    };

    // 초기 날짜 설정
    useEffect(() => {
      const storedDate = localStorage.getItem("selectedDate");
    
      if (storedDate) {
        setSelectedDate(new Date(storedDate));
        setCurrentDate(formatDate(new Date(storedDate)));
      } else {
        const today = new Date();
        const formattedStorageDate = formatStorageDate(today);
        localStorage.setItem("selectedDate", formattedStorageDate);
    
        setSelectedDate(today);
        setCurrentDate(formatDate(today));
      }
    }, []);

    // 날짜 선택 시 호출
    const handleDateSelect = (date: Date) => {
      const formattedStorageDate = formatStorageDate(date);
    
      setSelectedDate(date);
      setSelectedYear(date.getFullYear());
      setSelectedMonth(date.getMonth() + 1);
      setCurrentDate(formatDate(date));
      setShowCalendar(false);
    
      localStorage.setItem("selectedDate", formattedStorageDate);
    };

    //하루 전으로 이동
    const handlePrevDay = () => {
        const today = new Date(currentDate);
        today.setDate(today.getDate() - 1);
        setCurrentDate(formatDate(today));
    };

    //하루 후로 이동
    const handleNextDay = () => {
        const today = new Date(currentDate);
        today.setDate(today.getDate() + 1);
        setCurrentDate(formatDate(today));
    };

    // 이전 달로 이동
    const prevMonth = () => {
        if (selectedMonth === 1) {
        setSelectedMonth(12);
        setSelectedYear((prev) => prev - 1);
        } else {
        setSelectedMonth((prev) => prev - 1);
        }
    };

    // 다음 달로 이동
    const nextMonth = () => {
        if (selectedMonth === 12) {
        setSelectedMonth(1);
        setSelectedYear((prev) => prev + 1);
        } else {
        setSelectedMonth((prev) => prev + 1);
        }
    };

    // 해당 월의 날짜 수 가져오기
    const getDaysInMonth = (year: number, month: number): number => {
        return new Date(year, month, 0).getDate();
      };

    // 해당 월의 첫 번째 요일 가져오기
    const getFirstDayOfMonth = (year: number, month: number): number => {
        return new Date(year, month - 1, 1).getDay();
    };

    // 달력 렌더링
    const renderCalendar = () => {
        const days: JSX.Element[] = [];
        const firstDay = getFirstDayOfMonth(selectedYear, selectedMonth);
        const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
    
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className={styles.empty}></div>);
        }
    
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(selectedYear, selectedMonth - 1, day);
    
            const isSelected =
                selectedDate &&
                selectedDate.getFullYear() === date.getFullYear() &&
                selectedDate.getMonth() === date.getMonth() &&
                selectedDate.getDate() === date.getDate();
    
            const isToday =
                !selectedDate &&
                today.year === date.getFullYear() &&
                today.month === date.getMonth() + 1 &&
                today.date === day;
    
            days.push(
                <div
                    key={day}
                    className={`${styles.day} ${
                        isSelected ? styles.selectedDay : isToday ? styles.today : ""
                    }`} 
                    onClick={() => handleDateSelect(date)} 
                >
                    {day}
                </div>
            );
        }
    
        return days;
    };

    //설정 창
    const toggleSettings = () => {
      setIsOpen((prev) => !prev);
    };

    // 토글 버튼 클릭 시 상태 변경
    const toggleVisibility = async () => {
      try {
        const projectId = selectedProject?.id;

        if (!projectId) return;

        // 서버에 PATCH 요청 보내기 (공개 여부 변경)
        const response = await axios.patch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/projects/${selectedProject.id}/visibility`,
          {},
          {
            withCredentials: true,
          }
        );

        if (response.status === 200) {
          setIsPublic((prev) => !prev);
          dispatch(fetchProjectById(projectId));
        }
      } catch (error) {
        console.error("프로젝트 공개 설정 변경 오류:", error);
      }
    };

    //검색 페이지로 이동
    const handleSearch = () => {
      router.push("/search");
    };

    //프로젝트 삭제
    const handleDeleteProject = () => {
      if (projectId === undefined) {
        console.error("🚨 프로젝트 ID가 존재하지 않습니다!");
        return;
      }

      if(window.confirm("정말로 삭제하시겠습니까?")){
        dispatch(fetchDeleteProject(projectId));
      }
    };


    return(
        <div className={styles.container}>
      {/* 날짜 선택 영역 */}
      <div className={styles.dateContainer}>
        <button onClick={handlePrevDay} className={styles.dateBtn}>
          &lt;
        </button>
        <div className={styles.dateGroup}>
          <h1>{currentDate}</h1>
          <button
            onClick={() => setShowCalendar((prev) => !prev)}
            className={styles.pickerBtn}
          >
            ▼
          </button>
        </div>
        <button onClick={handleNextDay} className={styles.dateBtn}>
          &gt;
        </button>

        {/* 설정 및 검색 버튼 */}
        <div className={styles.optionContainer}>
          <button className={styles.searchBtn} onClick={handleSearch}>
            <FiSearch size={35} />
          </button>
          <button className={styles.optionBtn} onClick={toggleSettings}>
            <SlOptions size={35} />
          </button>

          {/* 설정창 */}
          {isOpen && (
            <div className={styles.optionPage}>
              {/* 프로젝트 공개 여부 */}
              <div className={styles.publicOption}>
                <h2>프로젝트 공개</h2>
                <div 
                  className={`${styles.toggleSwitch} ${isPublic ? styles.on : styles.off}`} 
                  onClick={toggleVisibility}
                >
                  <div className={styles.toggleBall}></div>
                </div>
              </div>

              {/* 로그아웃 및 회원탈퇴 */}
              <div className={styles.memberOptions}>
                <button className={styles.deleteProject} onClick={handleDeleteProject}>프로젝트 삭제</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 시계 영역 */}
      <div className={styles.clockSection}>
        <Clock />
      </div>

      {/* 칸트 차트 */}
      <div className={styles.chartSection}>
        <Chart />
      </div>
      
      {/* 달력 팝업 */}
      {showCalendar && (
        <div className={styles.calendarPopUp}>
          <div className={styles.calendarHeader}>
            <button onClick={prevMonth} className={styles.navButton}>
              &lt;
            </button>
            <span className={styles.monthYear}>
              {selectedYear}년 {selectedMonth}월
            </span>
            <button onClick={nextMonth} className={styles.navButton}>
              &gt;
            </button>
          </div>
          <div className={styles.weekdays}>
            {week.map((day, index) => (
              <div key={index} className={styles.weekday}>
                {day}
              </div>
            ))}
          </div>
          <div className={styles.days}>{renderCalendar()}</div>
        </div>
      )}
    </div>
  );
};

export default ProjectSchedule;