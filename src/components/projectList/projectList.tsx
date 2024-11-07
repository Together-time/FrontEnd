"use client";

import React from "react";
import { useRouter } from "next/navigation";
import styles from './projectList.module.css';

const ProjectList: React.FC = () => {
    const router = useRouter();

    //예시 데이터(후에 백엔드와 연동)
    const projects = [
        {id: 1, name: '경주 여행'},
        {id: 2, name: '스케쥴 프로젝트 일정'},
        {id: 3, name: '건빵 모임'},
    ];

    //프로젝트 추가 팝업
    const handleAddProject = () => {
        //예시 팝업(후에 커스텀 팝업 생성)
        const confirmed = window.confirm("새 프로젝트를 추가하시겠습니까?");

        if (confirmed) {
            console.log("프로젝트 추가됨");
        } else {
            console.log("프로젝트 추가 취소됨");
        }
    };

    return (
        <div className={styles.projectContainer}>
            {projects.map((project) => (
                <div key={project.id} className={styles.projectCircle}>
                    {project.name.charAt(0).toUpperCase()}
                </div>
            ))}

            {/*새로운 프로젝트 추가*/}
            <div className={`${styles.addCircle} ${styles.projectCircle}`}>
                +
            </div>
        </div>
    );
};

export default ProjectList;