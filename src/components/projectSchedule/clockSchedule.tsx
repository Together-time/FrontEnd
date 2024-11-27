"use client"

import React, { useState, useEffect } from "react";
import styles from "./clockSchedule.module.css";

const ClockSchedule = () => {
    const [currentTime, setCurrentTime] = useState<{ period: string; time: string }>({
        period: "",
        time: "",
    });
    const [timeAngle, setTimeAngle] = useState(0); // 시침 각도
    const [minuteAngle, setMinuteAngle] = useState(0);
    const [isAM, setIsAM] = useState(true);

    //현재 시간
    useEffect(() => {
        const updateCurrentTime = () => {
          const now = new Date();
          let hours = now.getHours(); 
          const minutes = String(now.getMinutes()).padStart(2, "0");
          const period = hours >= 12 ? "pm" : "am"; 
          hours = hours % 12 || 12; 
          setCurrentTime({ period, time: `${hours}:${minutes}` });
        };
    
        updateCurrentTime(); 
        const interval = setInterval(updateCurrentTime, 1000); 
        return () => clearInterval(interval); 
    }, []);

    //현재 시간 표시
    useEffect(() => {
        const updateAngle = () => {
          const now = new Date();
          const hours = now.getHours() % 12;
          const minutes = now.getMinutes();
      
          // 각도 계산
          const hourAngle = hours * 30 + (minutes / 60) * 30; 
          const minuteDeg = minutes * 6; 
      
          setTimeAngle(hourAngle); 
          setMinuteAngle(minuteDeg); 
        };
      
        updateAngle(); 
        const interval = setInterval(updateAngle, 1000); 
        return () => clearInterval(interval); 
    }, []);


    // 테스트 데이터(*백엔드 연동 후 삭제)
    const schedule = [
      { time: "09:00", task: "회의", color: "#FF0000" },
      { time: "13:00", task: "점심", color: "#00FF00" },
      { time: "15:30", task: "운동", color: "#0000FF" },
    ];
  
    // 시계의 시간을 위한 배열 (1부터 12까지)
    const hours = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

    //시계 숫자 정방향으로 배치
    const degrees = hours.map((_, index) => index * 30);

    //am, pm 표시
    const handleClick = () => {
        setIsAM((prev) => !prev);
    };

    return (
        <div>
            <div className={styles.clockContainer}>
                {hours.map((hour, index) => (
                    <div
                        key={hour}
                        className={styles.hour}
                        style={{ "--index": index } as React.CSSProperties}
                    >
                    <span
                        style={{
                         transform: `rotate(-${degrees[index]}deg)`,
                      }}
                    >
                    {hour}</span>
                </div>
                ))}
                {/* 현재 시간 표시 */}
                <div className={`${styles.currentTimeContainer} ${isAM ? styles.amContainer : styles.pmContainer}`}>
                    <span className={styles.period}>{currentTime.period}</span>
                    <span className={styles.time}>{currentTime.time}</span>
                    <span className={styles.day}>목 21</span>
                </div>
                <div className={`${styles.button} ${isAM ? styles.amBtn : styles.pmBtn}`}>
                    <div
                        className={`${styles.slider} ${isAM ? styles.am : styles.pm}`}
                        onClick={handleClick}
                    >
                        {isAM ? "AM" : "PM"}
                    </div>
                </div>
            </div>
        </div>
        );
    };
  
  export default ClockSchedule;