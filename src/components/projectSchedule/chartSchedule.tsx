"use client"

import React, { useState } from "react";
import styles from "./chartSchedule.module.css"


interface Task {
    id: number;
    name: string;
    startTime: string; // "HH:mm" 형식
    endTime: string;   // "HH:mm" 형식
  }
  
  // 예제 일정 데이터
  const tasks: Task[] = [
    { id: 1, name: "팀 회의", startTime: "09:00", endTime: "11:00" },
    { id: 2, name: "개발 작업", startTime: "11:00", endTime: "13:00" },
    { id: 3, name: "프로젝트 리뷰", startTime: "13:00", endTime: "16:00" },
    { id: 4, name: "마무리 회의", startTime: "16:00", endTime: "17:00" },
  ];
  
  // ⏰ 시간 변환 함수 (HH:mm → % 변환)
  const timeToMinutes = (time: string) => {
    const [hour, minute] = time.split(":").map(Number);
    return hour * 60 + minute;
  };

  // 📌 가장 이른 시작 시간과 가장 늦은 종료 시간 찾기
const earliestTime = Math.min(...tasks.map((task) => timeToMinutes(task.startTime)));
const latestTime = Math.max(...tasks.map((task) => timeToMinutes(task.endTime)));

// 시간 범위를 %로 변환하는 함수
const timeToPercentage = (time: string) => {
  const totalDuration = latestTime - earliestTime;
  return ((timeToMinutes(time) - earliestTime) / totalDuration) * 100;
};

const ChartSchedule: React.FC = () => {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpand = () => {
        setIsExpanded((prev) => !prev);
    };

    return (
        <div className={styles.chartWrapper}>
            <div className={styles.buttonContainer}>
                {/* 토글 버튼 */}
                <button className={styles.toggleButton} onClick={() => setIsExpanded((prev) => !prev)}>
                    {isExpanded ? "▼" : "▲"}
                </button>

                {/* 일정 추가 버튼 */}
                <button className={styles.plusButton}>
                    +
                </button>

            </div>

            {/* 애니메이션 효과가 적용된 차트 */}
            <div className={`${styles.chartContainer} ${isExpanded ? styles.expanded : styles.collapsed}`}>
                {/* 시간 축 */}
                <div className={styles.timeLabels}>
                {Array.from(
                    { length: Math.ceil((latestTime - earliestTime) / 60) + 1 },
                    (_, i) => {
                    const hour = Math.floor((earliestTime + i * 60) / 60);
                    return `${hour.toString().padStart(2, "0")}:00`;
                    }
                ).map((time, index) => (
                    <div key={index} className={styles.timeLabel}>
                    {time}
                    </div>
                ))}
                </div>

                {/* 일정 막대 (그래프 스타일) */}
                <div className={styles.tasks}>
                {tasks.map((task, index) => (
                    <div
                    key={task.id}
                    className={styles.task}
                    style={{
                        left: `${timeToPercentage(task.startTime)}%`,
                        width: `${timeToPercentage(task.endTime) - timeToPercentage(task.startTime)}%`,
                        top: `${index * 40}px`,
                    }}
                    >
                    {task.name}
                    </div>
                ))}
                </div>
            </div>
            </div>
        );
        };

export default ChartSchedule;