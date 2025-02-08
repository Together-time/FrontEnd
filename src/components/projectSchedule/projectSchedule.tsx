"use client"

import React, {useState, useEffect} from "react";
import styles from "./projectSchedule.module.css";
import Clock from "./clockSchedule";
import Chart from "./chartSchedule";
import DatePicker from "react-datepicker";
import { newDate } from "react-datepicker/dist/date_utils";

const ProjectSchedule: React.FC = () => {
    const [currentDate, setCurrentDate] = useState("");
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [showCalendar, setShowCalendar] = useState(false);
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);

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