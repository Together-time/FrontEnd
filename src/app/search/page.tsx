"use client";

import React, { useState, useEffect } from "react";
import { IoSearch } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { fetchSearchProjects } from "../store/searchSlice";
import { useAppSelector } from '@/app/store/store';
import { useAppDispatch, RootState } from "@/app/store/store";
import "@/app/search/page.css";

const Search: React.FC = () => {
    const [keyword, setKeyword] = useState("");
    const dispatch = useAppDispatch();
    const { searchResults, status, error } = useSelector((state: any) => state.search);

    const handleSearch = () => {
        if (keyword.trim() === "") return;
        dispatch(fetchSearchProjects(keyword));
    }

    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            handleSearch(); 
        }
    };

    return (
        <div className="searchPage">
            <input className="searchInput" 
                    placeholder="검색어 입력" 
                    value={keyword} 
                    onChange={(e) => setKeyword(e.target.value)} 
                    onKeyDown={handleKeyPress}></input>
            <IoSearch className="searchIcon" onClick={handleSearch}/>

            {/* 검색 결과 출력 */}
        </div>
    );
};

export default Search;