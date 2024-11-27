"use client"

import React from "react";
import styles from "./projectSchedule.module.css";
import Clock from "./clockSchedule";

const ProjectSchedule: React.FC = () => {
    return(
        <div>
            <Clock />
            <p>세번째 섹션입니다.</p>
        </div>
    );
};

export default ProjectSchedule;