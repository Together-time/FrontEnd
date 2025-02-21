"use client";

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useAppDispatch, RootState } from "@/app/store/store";
import InvitePopup from '@/components/common/inviteMember';
import EditTagPopup from './tagEditPopup';
import { FaRegCommentDots } from "react-icons/fa";
import styles from "./projectInformation.module.css";
import { useAppSelector } from '@/app/store/store';
import useChatWebSocket from "@/app/hooks/useChatWebSocket";
import { fetchMessages, fetchUnreadCount } from "@/app/store/chatSlice";


const ProjectInformation: React.FC = () => {
    const [isInviteMember, setIsInviteMember] = useState(false);
    const [isEditTags, setIsEditTags] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [input, setInput] = useState("");
    const [userName, setUserName] = useState<string | null>(null);
    const dispatch = useAppDispatch();

    //프로젝트 정보 가져오기
    const selectedProject = useAppSelector((state) => state.selectedProject.selectedProject);
    const projectId = selectedProject?.id;
    const { messages, sendMessage } = useChatWebSocket();
    //팀원 목록 가져오기
    const members = useAppSelector((state) => state.team.members);
    const loading = useAppSelector((state) => state.team.loading);
    const error = useAppSelector((state) => state.team.error);

    //사용자 이름 가져오기
    useEffect(() => {
        const storedUser = localStorage.getItem("userInfo");
        if (storedUser) {
            try {
                const userData = JSON.parse(storedUser);
                setUserName(userData.name);
            } catch (error) {
                console.error("사용자 정보가 없습니다:", error);
            }
        }
    }, []);

    useEffect(() => {
        if (projectId) {
            dispatch(fetchMessages({ projectId })); 
            dispatch(fetchUnreadCount({ projectId }));
        }
    }, [dispatch, projectId]); 

    // 🔹 접속 중인 사용자를 상단에 정렬하는 임시 로직 추가
    const sortedUsers = [...members]
    .map((user) => ({
      ...user,
      isOnline: Math.random() > 0.5, 
    }))
    .sort((a, b) => {
      if (a.isOnline === b.isOnline) {
        return a.nickname.localeCompare(b.nickname); 
      }
      return b.isOnline ? 1 : -1; 
    });
  
  

    //팀원 초대
    const openInvitePopup = () => setIsInviteMember(true);
    const closeInvitePopup = () => setIsInviteMember(false);

    //태그 편집 팝업
    const openEditTagPopup = () => setIsEditTags(true);
    const closeEditTagPopup = () => setIsEditTags(false);

    //읽지 않은 메시지 수
    const unreadMessages = 3;

    // 채팅창 열기
    const openChat = () => setShowChat(true);

    // 채팅창 닫기
    const closeChat = () => setShowChat(false);

    //채팅 보내기
    const handleSend = () => {
        if (input.trim()) {
            sendMessage(input);
            setInput("");
        }
    };

    return(
<div>
            {!showChat ? (
                // 기본 섹션
                <div className={styles.informationContainer}>
                    <div className={styles.firstContainer}>
                        <h1>{selectedProject ? selectedProject.title : ""}</h1>
                    </div>
                    <div className={styles.secondContainer}>
                        <h3>현재 참여 중인 인원</h3>
                        <ul className={styles.userList}>
                        {sortedUsers.map((user) => (
                            <li key={user.id} className={styles.userItem}>
                            <span>{user.nickname}</span>
                            {user.isOnline && <span className={styles.onlineIndicator}></span>}
                            </li>
                        ))}
                        </ul>
                        <button onClick={openInvitePopup} className={styles.memberInviteBtn}>
                            + 초대
                        </button>
                        {isInviteMember && (
                            <InvitePopup isOpen={isInviteMember} onClose={closeInvitePopup} />
                        )}
                    </div>
                    <div className={styles.thirdContainer}>
                        <h3>태그</h3>
                        <ul className={styles.projecttags}>
                        {selectedProject?.tags && selectedProject.tags.length > 0 ? (
                        selectedProject.tags.map((tag, index) => (
                            <li key={index} className={styles.tag}>
                            {tag}
                            </li>
                        ))
                        ) : (
                        <p>태그 없음</p>
                        )}
                    </ul>
                        <button className={styles.tagEditBtn} onClick={openEditTagPopup}>
                            + 태그 편집
                        </button>
                        {isEditTags && (
                            <EditTagPopup isOpen={isEditTags} onClose={closeEditTagPopup} />
                        )}
                    </div>
                    <div className={styles.forthContainer}>
                        <div className={styles.iconWrapper}>
                            <FaRegCommentDots className={styles.commentIcon} onClick={openChat} />
                            <span className={styles.unreadBadge}>
                                {unreadMessages > 99 ? "99+" : unreadMessages}
                            </span>
                        </div>
                        <h2>{userName ? userName : "로그인해주세요"}</h2>
                    </div>
                </div>
            ) : (
                // 채팅창
                <div className={styles.chatContainer}>
                    <div className={styles.titleContainer}>
                        <h1>대전 가요~</h1>
                    </div>
                    <div className={styles.closeContainer}>
                        <button onClick={closeChat} className={styles.closeChatBtn}>
                            X
                        </button>
                    </div>
                    <div>
                    {messages.length === 0 ? (
                        <p>메시지가 없습니다.</p>
                        ) : (
                        messages.map((msg:any, index:any) => (
                            <div key={index} className="chat-message">
                            {msg}
                            </div>
                        ))
                    )}
                    </div>
                    <div className={styles.chatInput}>
                        <input value={input} onChange={(e)=> setInput(e.target.value)} />
                        <button onClick={handleSend}>전송</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectInformation;