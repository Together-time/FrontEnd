"use client"

import React, { useEffect, useState } from "react";
import styles from "./chartSchedule.module.css";
import axios from "axios";
import { useAppDispatch, useAppSelector } from '@/app/store/store';
import { RootState } from "@/app/store/store";
import { fetchProjectSchedules } from "@/app/store/scheduleSlice";


interface Task {
    id: number;
    title: string;
    memo: string;
    startedDate: string;
    startedTime: string;
    endedDate: string;
    endedTime: string;
    color: string;
}

const ChartSchedule: React.FC = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [schedule, setSchedule] = useState("");
    const [memo, setMemo] = useState("");  
    const [selectedStartTime, setSelectedStartTime] = useState(""); 
    const [selectedEndTime, setSelectedEndTime] = useState(""); 
    const [color, setColor] = useState<{ [key: string]: string }>({});
    const [selectedColor, setSelectedColor] = useState<string>("orange");
    const [showColorPicker, setShowColorPicker] = useState<boolean>(false);

    // Redux에서 프로젝트 데이터 불러오기
    const selectedProject = useAppSelector((state: RootState) => state.selectedProject.selectedProject);
    const projectId = selectedProject?.id; 
    
    const dispatch = useAppDispatch();

    // 로컬 스토리지에서 선택된 날짜 가져오기
    const [selectedDate, setSelectedDate] = useState(() => {
        const storedDate = localStorage.getItem("selectedDate");
        return storedDate ? new Date(storedDate) : new Date();
    });

    const schedules = useAppSelector((state: RootState) => state.schedule.schedules);

    const [tasks, setTasks] = useState<Task[]>([]);
    const [updateTrigger, setUpdateTrigger] = useState(false);

    useEffect(() => {
        if (projectId) {
            dispatch(fetchProjectSchedules(projectId));
        }
    }, [dispatch, projectId, updateTrigger]);

    //데이터 형식 변환
    useEffect(() => {
        if (schedules.length > 0) {
            const convertedTasks: Task[] = schedules.map((schedule): Task => {
                // ✅ 날짜 변환: "YYYY-MM-DD" 형식 문자열로 변환
                const formatDate = (date: string | number[]): string => {
                    if (Array.isArray(date)) {
                        return date.map(num => num.toString().padStart(2, "0")).join("-"); 
                    }
                    return date; // 이미 문자열이면 그대로 반환
                };
    
                // ✅ 시간 변환: '분' 단위 숫자로 변환
                const formatTime = (time: number[] | string): string => {
                    if (Array.isArray(time)) {
                        return time.map(num => num.toString().padStart(2, "0")).join(":"); 
                    }
                    return ""; // 잘못된 값이면 기본값 0
                };
    
                return {
                    id: schedule.id,
                    title: schedule.title,
                    memo: schedule.memo || "",
                    startedDate: formatDate(schedule.startedDate), 
                    startedTime: formatTime(schedule.startedTime), 
                    endedDate: formatDate(schedule.endedDate),
                    endedTime: formatTime(schedule.endedTime),
                    color: schedule.color,
                };
            });
    
            setTasks(convertedTasks);
        }
    }, [schedules]);
    
    

    useEffect(() => {
        const storedDate = localStorage.getItem("selectedDate");

        if (storedDate) { //항상 실행되지만 내부에서 `storedDate` 체크
            setSelectedDate(new Date(storedDate));
        }
    }, [isPopupOpen]);

    //색상 불러오기
    useEffect(() => {
        fetch("/colors.json")
            .then((response) => response.json())
            .then((data) => {
                console.log("색상 데이터:", data);
                setColor(data);
            })
            .catch((error) => console.error("색상 데이터 로드 실패:", error));
    }, []);

    // 일정 저장 로직 (백엔드 POST 요청)
    const handleSaveSchedule = async () => {
        const token = localStorage.getItem("jwtToken");

        // 데이터 확인 (필수 입력값)
        if (!schedule || !selectedDate || !selectedStartTime || !selectedEndTime){
            alert("일정을 입력하고 시작/종료 시간을 선택해주세요.");
            return;
        }

        const scheduleData = {
            title: schedule,
            memo: memo || "",
            startedDate: selectedDate.toISOString().split("T")[0], 
            startedTime: selectedStartTime,
            endedDate: selectedDate.toISOString().split("T")[0], 
            endedTime: selectedEndTime,
            color: selectedColor, 
        };

        try {
            const response = await axios.post( 
                `${process.env.NEXT_PUBLIC_API_URL}/api/schedule/${projectId}`,
                scheduleData,
                {
                    withCredentials: true 
                }
            );

            if (response.status === 200 && response.data){
                alert("일정이 저장되었습니다!");
                setIsPopupOpen(false); 
                setSchedule("");
                setMemo("");
                setSelectedStartTime("");
                setSelectedEndTime("");

                //일정 저장 후 업데이트
                setUpdateTrigger((prev) => !prev);
            } else {
                throw new Error("일정 저장 실패");
            }
        } catch(error){
            console.error("일정 저장 중 오류 발생: ", error);
            alert("일정 저장 중 문제가 발생했습니다.");
        }
    };

      // ⏰ 시간 변환 함수 (HH:mm → % 변환)
    const timeToMinutes = (time: string) => {
        const [hour, minute] = time.split(":").map(Number);
        return hour * 60 + minute;
    };

    // 📌 가장 이른 시작 시간과 가장 늦은 종료 시간 찾기
    const earliestTime = tasks.length > 0 ? Math.min(...tasks.map((task) => timeToMinutes(task.startedTime))) : 0;
    const latestTime = tasks.length > 0 ? Math.max(...tasks.map((task) => timeToMinutes(task.endedTime))) : 1440;

    const sortedTasks = [...tasks].sort((a, b) => timeToMinutes(a.startedTime) - timeToMinutes(b.startedTime));

    // 시간 범위를 %로 변환하는 함수
    const timeToPercentage = (time: string) => {
        const totalDuration = latestTime - earliestTime || 1; 
        return ((timeToMinutes(time) - earliestTime) / totalDuration) * 100;
    };

    return (
        <div className={styles.chartWrapper}>
            <div className={styles.buttonContainer}>
                <button className={styles.toggleButton} onClick={() => setIsExpanded((prev) => !prev)}>
                    {isExpanded ? "▼" : "▲"}
                </button>
                <button className={styles.plusButton} onClick={() => setIsPopupOpen(true)}>+</button>
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
                {sortedTasks.map((task, index) => (
                    <div
                    key={task.id}
                    className={styles.task}
                    style={{
                        left: `${timeToPercentage(task.startedTime)}%`,
                        width: `${timeToPercentage(task.endedTime) - timeToPercentage(task.startedTime)}%`,
                        top: `${index * 40}px`,
                        backgroundColor: task.color,
                    }}
                    >
                    {task.title}
                    </div>
                ))}
                </div>
            </div>
            {isPopupOpen && (
                <div className={styles.scheduleOverlay} onClick={() => setIsPopupOpen(false)}>
                    <div className={styles.scheduleContent} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.scheduleHeader}>
                            <button className={styles.schedulecancel} onClick={() => setIsPopupOpen(false)}>X</button>
                        </div>
                        <div className={styles.schedulePlus}>
                            <input
                                type="text"
                                className={styles.scheduleInput}
                                value={schedule}
                                onChange={(e) => setSchedule(e.target.value)}
                                placeholder="일정을 입력해주세요."
                            />
                            <div className={styles.scheduleTime}>
                                <div className={styles.timeContainer}>
                                    <h2>시작 시간</h2>
                                    <div className={styles.rightAlign}>
                                        <h3 className={styles.dateContainer}>{selectedDate.toLocaleDateString() || "날짜를 선택하세요"}</h3>
                                        <input
                                            type="time"
                                            className={styles.timeInput}
                                            value={selectedStartTime}
                                            onChange={(e) => setSelectedStartTime(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className={styles.timeContainer}>
                                    <h2>종료 시간</h2>
                                    <div className={styles.rightAlign}>
                                        <h3 className={styles.dateContainer}>{selectedDate.toLocaleDateString() || "날짜를 선택하세요"}</h3>
                                        <input
                                            type="time"
                                            className={styles.timeInput}
                                            value={selectedEndTime}
                                            onChange={(e) => setSelectedEndTime(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className={styles.scheduleColor}>
                                <div 
                                    className={styles.colorCircle} 
                                    style={{ backgroundColor: color[selectedColor] || "rgb(255, 165, 0)" }} 
                                    onClick={() => setShowColorPicker(!showColorPicker)}
                                ></div>
                                <h1 onClick={() => setShowColorPicker(!showColorPicker)}>
                                    {selectedColor.charAt(0).toUpperCase() + selectedColor.slice(1)}
                                </h1>
                            </div>
                            {showColorPicker && (
                                <div className={styles.colorPickerContainer}>
                                    {Object.entries(color).map(([colorName, colorValue]) => (
                                        <div 
                                            key={colorName} 
                                            className={styles.colorOption}
                                            style={{ backgroundColor: colorValue }}
                                            onClick={() => {
                                                setSelectedColor(colorName); 
                                                setShowColorPicker(false);  
                                            }}
                                        >
                                            <div className={styles.colorCircle} style={{ backgroundColor: colorValue }}></div>
                                            <span className={styles.colorText}>{colorName.charAt(0).toUpperCase() + colorName.slice(1)}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className={styles.scheduleMemo}>
                                <h1>메모</h1>
                                <textarea
                                    className={styles.memoArea}
                                    placeholder="메모를 입력하세요..."
                                    value={memo}
                                    onChange={(e) => setMemo(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* 일정 저장 버튼 (백엔드로 데이터 전송) */}
                        <div className={styles.buttonContainer}>
                            <button className={styles.scheduleSave} onClick={handleSaveSchedule}>저장</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChartSchedule;
