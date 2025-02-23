"use client"

import React, { useState, useEffect, useRef } from "react";
import styles from "./clockSchedule.module.css";
import { useAppDispatch, useAppSelector } from '@/app/store/store';
import { fetchProjectSchedules } from "@/app/store/scheduleSlice";
import { fetchDeleteSchedule } from "@/app/store/scheduleSlice";
import { RootState } from "@/app/store/store";

const ClockSchedule = () => {
    const [currentTime, setCurrentTime] = useState<{ period: string; time: string }>({
        period: "",
        time: "",
    });
    const [timeAngle, setTimeAngle] = useState(0); // 시침 각도
    const [minuteAngle, setMinuteAngle] = useState(0);
    const [isAM, setIsAM] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const [menuPosition, setMenuPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
    const buttonRefs = useRef<{ [key: number]: HTMLButtonElement | null }>({});
    const setButtonRef = (scheduleId: number) => (el: HTMLButtonElement | null) => {
        buttonRefs.current[scheduleId] = el;
    };    

    // Redux에서 프로젝트 데이터 불러오기
    const selectedProject = useAppSelector((state: RootState) => state.selectedProject.selectedProject);
    const projectId = selectedProject?.id; 
    const schedules = useAppSelector((state: RootState) => state.schedule.schedules);
    
    const dispatch = useAppDispatch();
  
    //스케쥴 정보 가져오기
    useEffect(() => {
        if (projectId) {
            dispatch(fetchProjectSchedules(projectId));
        }
    }, [dispatch, projectId]);
    

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

    //시계침 각도 변환
    const timeToDegrees = (time: string | number[]): number => {
        let hour, minute;

        if (Array.isArray(time)) {
            [hour, minute] = time;
        } else if (typeof time === "string") {
            [hour, minute] = time.split(":").map(Number);
        } else {
            return 0;
        }

        // 12시간제 변환
        const hourIn12 = hour % 12 || 12; // 0시는 12시로 변환
        const degrees = hourIn12 * 30 + minute * 0.5; // 1시간 = 30도, 1분 = 0.5도

        return degrees;
    };


    
    // 숫자(분) 또는 배열 → "HH:mm" 문자열 변환
    const timeToString = (time: number | string | number[]): string => {
        if (Array.isArray(time)) {
            // 배열 형태 ([HH, MM])인 경우 변환
            return `${time[0].toString().padStart(2, "0")}:${time[1].toString().padStart(2, "0")}`;
        }
        if (typeof time === "string") {
            return time;
        }
        // 숫자(분)인 경우 변환
        const hours = Math.floor(time / 60);
        const minutes = time % 60;
        return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
    };

    const formatTime = (timeArray: any) => {
        if (!Array.isArray(timeArray) || timeArray.length !== 2) return "";
        const [hour, minute] = timeArray;
        return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
    };

    const sortedSchedules = [...schedules].sort((a, b) => {
        const aStart = Number(a.startedTime[0]) * 60 + Number(a.startedTime[1]); 
        const bStart = Number(b.startedTime[0]) * 60 + Number(b.startedTime[1]); 
        return aStart - bStart;
    });

    //오전/오후 필터링
    const filteredSchedules = schedules.filter(schedule => {
        const startHour = Array.isArray(schedule.startedTime) ? schedule.startedTime[0] : parseInt(schedule.startedTime.split(":")[0], 10);
        return isAM ? startHour < 12 : startHour >= 12;
    });

    // 시계의 시간을 위한 배열 (1부터 12까지)
    const hours = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

    //시계 숫자 정방향으로 배치
    const degrees = hours.map((_, index) => index * 30);

    //am, pm 표시
    const handleClick = () => {
        setIsAM((prev) => !prev);
    };

    const togglePanel = () => {
        setIsOpen((prev) => {
            console.log("패널 상태 변경:", !prev);
            return !prev;
        });
    };

    // 메뉴 토글 핸들러
    const toggleMenu = (scheduleId: number, event: React.MouseEvent<HTMLButtonElement>) => {
        if (openMenuId === scheduleId) {
            setOpenMenuId(null); 
        } else {
            const button = buttonRefs.current[scheduleId]; 
            if (button) {
                const rect = button.getBoundingClientRect();
                const menuHeight = 50; 
                
                setMenuPosition({
                    top: Math.round(rect.bottom + window.scrollY),
                    left: Math.round(rect.left + window.scrollX - 50),
                });
            }
            setOpenMenuId(scheduleId);
        }
    };


    // 바깥 클릭 시 메뉴 닫기
    const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        if (!target.closest(`.${styles.optionsMenu}`) && !target.closest(`.${styles.optionsButton}`)) {
            setOpenMenuId(null);
        }
    };
    

    // 컴포넌트가 마운트될 때 이벤트 리스너 추가
    useEffect(() => {
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    // 일정 삭제 핸들러
    const handleDelete = (scheduleId: number | undefined) => {
        if (!projectId || !scheduleId) {
            console.error("프로젝트 ID 또는 일정 ID가 유효하지 않습니다.");
            return;
        }
    
        if (window.confirm("정말 삭제하시겠습니까?")) {
            dispatch(fetchDeleteSchedule({ projectId, scheduleId }));
        }
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
                {/* 일정 표시 */}
                {filteredSchedules.map((schedule) => {
                    const startAngle = timeToDegrees(schedule.startedTime);
                    const endAngle = timeToDegrees(schedule.endedTime);
                    const durationAngle = (endAngle - startAngle + 360) % 360;
                    const textAngle = startAngle + durationAngle / 2; 

                    // 🔥 180도를 넘으면 좌우 반전
                    const flipText = textAngle > 360 || textAngle < 90 ? 0 : 180; 

                    return (
                        <>
                            <div key={schedule.id} className={styles.scheduleArc} 
                                style={{
                                    "--start-angle": `${startAngle}deg`,
                                    "--duration-angle": `${durationAngle}deg`,
                                    "--color": schedule.color,
                                } as React.CSSProperties}>
                            </div>
                            <div key={`${schedule.id}-text`} className={styles.scheduleTextContainer} 
                                style={{ 
                                    "--start-angle": `${startAngle}deg`,
                                    "--duration-angle": `${durationAngle}deg`,
                                    "--text-angle": `${textAngle}deg`,
                                    "--radius": "32%",
                                } as React.CSSProperties}>
                
                                <h2 className={styles.scheduleTitle}style={{
                                    transform: `rotate(calc(var(--text-angle) - 90deg)) rotate(${flipText}deg)`, 
                                    transformOrigin: "center"
                                }}>{schedule.title}</h2>
                            </div>
                        </>
                    );
                })}

                {/* 현재 시간 표시 */}
                <div className={`${styles.currentTimeContainer} ${isAM ? styles.amContainer : styles.pmContainer}`}>
                    <span className={styles.period}>{currentTime.period}</span>
                    <span className={styles.time}>{currentTime.time}</span>
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
            <div className={styles.textScheduleContainer}>
                <button className={`${styles.textScheduleButton} ${isOpen ? styles.moveLeft : ""}`} onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? ">" : "<"}
                </button>
            </div>

            {/* 텍스트형 일정표) */}
            <div className={`${styles.textPanel} ${isOpen ? styles.open : ""}`}>
                {schedules.length === 0 ? (
                    <p className={styles.noSchedules}>일정이 없습니다.</p>
                ) : (
                    sortedSchedules.map((schedule) => (
                        <div key={schedule.id} className={styles.scheduleItem}>
                            <span className={styles.textScheduleColor} style={{ backgroundColor: schedule.color }}></span>
                            <div className={styles.textScheduleContent}>
                                <p className={styles.textScheduleTitle}>{schedule.title}</p>
                                <p className={styles.textScheduleTime}>
                                    {formatTime(schedule.startedTime)} ~ {formatTime(schedule.endedTime)}
                                </p>
                            </div>
                            <button
                                ref={setButtonRef(schedule.id)}
                                className={styles.optionsButton}
                                onClick={(e) => toggleMenu(schedule.id, e)}
                            >
                                ⋮
                            </button>
                            {/* 옵션 메뉴 (수정, 삭제) */}
                            {openMenuId === schedule.id && (
                                <div
                                    className={styles.optionsMenu}
                                    style={{ top: `${menuPosition.top}px`, left: `${menuPosition.left}px` }}
                                >
                                    <button className={styles.optionItem}>
                                        수정
                                    </button>
                                    <button className={styles.optionItem} onClick={() => handleDelete(schedule.id)}>
                                        일정 삭제
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
        );
    };
  
  export default ClockSchedule;