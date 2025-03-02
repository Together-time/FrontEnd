import React, { useEffect, useState } from "react";
import styles from "./SchedulePopup.module.css"; // 스타일 적용
import { useAppDispatch, useAppSelector } from "@/app/store/store";
import { fetchProjectSchedules } from "../store/searchSlice";

interface Schedule {
    id: number;
    title: string;
    startedTime: [number, number]; // [hour, minute]
    endedTime: [number, number];   // [hour, minute]
    color: string;
}

interface ProjectPopupProps {
    projectId: number;
    title: string;
    onClose: () => void;
}

const ProjectPopup: React.FC<ProjectPopupProps> = ({ projectId, title, onClose }) => {
    const dispatch = useAppDispatch();
    const schedules = useAppSelector(state => state.search.schedules[projectId] || []);
    const [isAM, setIsAM] = useState(true); // AM/PM 필터링

    // 프로젝트 일정 데이터 불러오기
    useEffect(() => {
        dispatch(fetchProjectSchedules(projectId));
    }, [dispatch, projectId]);

    // 일정 필터링 (AM/PM 구분)
    const filteredSchedules: Schedule[] = schedules.filter((schedule: Schedule) => {
        const startHour = schedule.startedTime[0]; // [hour, minute] 배열에서 hour 추출
        return isAM ? startHour < 12 : startHour >= 12;
    });

    // 시간 데이터를 각도로 변환하는 함수
    const timeToDegrees = (time: number[]): number => {
        const [hour, minute] = time;
        const hourIn12 = hour % 12 || 12;
        return hourIn12 * 30 + minute * 0.5; // 1시간 = 30도, 1분 = 0.5도
    };

    return (
        <div className={styles.popupOverlay}>
            <div className={styles.popupContainer}>
                <button className={styles.closeButton} onClick={onClose}>✖</button>
                <h2 className={styles.popupTitle}>{title}</h2>

                {/* 시계형 스케줄러 */}
                <div className={styles.popupClockContainer}>
                    {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((hour, index) => (
                        <div key={hour} className={styles.popupHour} style={{ "--index": index } as React.CSSProperties}>
                            <span style={{ transform: `rotate(-${index * 30}deg)` }}>{hour}</span>
                        </div>
                    ))}

                    {/* 일정 표시 */}
                    {filteredSchedules.map(schedule => {
                        const startAngle = timeToDegrees(schedule.startedTime);
                        const endAngle = timeToDegrees(schedule.endedTime);
                        const durationAngle = (endAngle - startAngle + 360) % 360;
                        const textAngle = startAngle + durationAngle / 2;
                        const flipText = textAngle > 360 || textAngle < 90 ? 0 : 180;

                        return (
                            <React.Fragment key={schedule.id}>
                                <div className={styles.popupScheduleArc}
                                    style={{
                                        "--start-angle": `${startAngle}deg`,
                                        "--duration-angle": `${durationAngle}deg`,
                                        "--color": schedule.color,
                                    } as React.CSSProperties} />
                                
                                <div className={styles.popupScheduleTextContainer}
                                    style={{
                                        "--start-angle": `${startAngle}deg`,
                                        "--duration-angle": `${durationAngle}deg`,
                                        "--text-angle": `${textAngle}deg`,
                                        "--radius": "30%",
                                    } as React.CSSProperties}>
                                    <h2 className={styles.popupScheduleTitle}
                                        style={{
                                            transform: `rotate(calc(var(--text-angle) - 90deg)) rotate(${flipText}deg)`,
                                            transformOrigin: "center"
                                        }}>
                                        {schedule.title}
                                    </h2>
                                </div>
                            </React.Fragment>
                        );
                    })}

                    {/* AM/PM 토글 버튼 */}
                    <div 
                        className={`${styles.popupButton} ${isAM ? styles.popupAmBg : styles.popupPmBg}`}
                        onClick={() => setIsAM(prev => !prev)}
                    >
                        <span>AM</span>
                        <div className={`${styles.popupSlider} ${isAM ? styles.popupAm : styles.popupPm}`}></div>
                        <span>PM</span>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default ProjectPopup;
