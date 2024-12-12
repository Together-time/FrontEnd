"use client";

import React, {useState} from "react";
import { BiCalendar } from "react-icons/bi";
import styles from './projectList.module.css';
import Popup from './projectAddPopUp';

const ProjectList: React.FC = () => {
    const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
    const [isPopupOpen, setIsPopupOpen] = useState(false);

    //예시 데이터(후에 백엔드와 연동)
    const projects = [
        {id: 1, name: '경주 여행'},
        {id: 2, name: '스케쥴 프로젝트 일정'},
        {id: 3, name: '건빵 모임'},
    ];

    return (
        <div className={styles.projectContainer}>

            {/*현재 참여 중인 프로젝트*/}
            <div className={styles.projectIcon} title="현재 참여중인 시간표">
                <BiCalendar />
            </div>

            {projects.map((project) => (
                <div key={project.id} className={`${styles.projectCircle} ${
                    selectedProjectId === project.id ? styles.selectedProjectActive : ""
                  }`}
                  onClick={() => setSelectedProjectId(project.id)}
                >
                    {project.name.charAt(0).toUpperCase()}
                </div>
            ))}

            {/*새로운 프로젝트 추가*/}
            <div className={`${styles.addCircle} ${styles.projectCircle}`} onClick={() => setIsPopupOpen(true)}>
                +
            </div>

            {/* 프로젝트 추가 팝업 */}
            {isPopupOpen && (
                <Popup isOpen={isPopupOpen} onClose={() => setIsPopupOpen(false)} />
            )}
        </div>
    );
};

export default ProjectList;