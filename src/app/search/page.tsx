"use client";

import React, { useState, useEffect } from "react";
import { IoSearch } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { fetchSearchProjects } from "../store/searchSlice";
import { useAppSelector } from '@/app/store/store';
import { useAppDispatch, RootState } from "@/app/store/store";
import { fetchProjectSchedules } from "../store/searchSlice";
import SchedulePopup from "./SchedulePopup";
import "@/app/search/page.css";

const Search: React.FC = () => {
    const [keyword, setKeyword] = useState("");
    const dispatch = useAppDispatch();
    const { searchResults, status, error } = useSelector((state: any) => state.search);
    const [selectedProject, setSelectedProject] = useState<{ id: number; title: string } | null>(null);

    const handleSearch = () => {
        if (keyword.trim() === "") return;
        dispatch(fetchSearchProjects(keyword));
    }

    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            handleSearch(); 
        }
    };


    const openPopup = (projectId: number, title: string) => {
        setSelectedProject({ id: projectId, title });
    };

    const closePopup = () => {
        setSelectedProject(null);
    };

    return (
        <div className="searchPage">
            <div className="searchContainer">
                <input className="searchInput" 
                        placeholder="검색어 입력" 
                        value={keyword} 
                        onChange={(e) => setKeyword(e.target.value)} 
                        onKeyDown={handleKeyPress}/>
                <IoSearch className="searchIcon" onClick={handleSearch}/>
            </div>

            {/* 검색 결과 출력 */}
            <div className="searchList">
                {searchResults.length === 0 && status !== "loading" && <p> 검색 결과가 없습니다.</p>}

                {searchResults.map((project: any) => (
                    <div key={project.id} className="projectCard" onClick={() => openPopup(project.projectId, project.title)}>
                        <div className="circle">{project.title[0]}</div>
                        <div className="projectInfo">
                            <h3>{project.title}</h3>
                            <p className="tags">
                                {project.tags.map((tag:string, index:number) => (
                                    <span key={index}>#{tag} </span>
                                ))}
                            </p>
                        </div>
                        <span className="views">조회수 {project.views !== undefined ? project.views : 0}</span>
                    </div>
                ))}
            </div>

            {/* 팝업 창 */}
            {selectedProject && <SchedulePopup projectId={selectedProject.id} title={selectedProject.title} onClose={closePopup} />}
        </div>
    );
};

export default Search;