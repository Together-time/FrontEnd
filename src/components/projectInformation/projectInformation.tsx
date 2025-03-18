"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useAppDispatch, RootState } from "@/app/store/store";
import InvitePopup from '@/components/common/inviteMember';
import EditTagPopup from './tagEditPopup';
import { FaRegCommentDots } from "react-icons/fa";
import styles from "./projectInformation.module.css";
import { useAppSelector } from '@/app/store/store';
import useChatWebSocket from "@/app/hooks/useChatWebSocket";
import useOnlineUsers from "@/app/hooks/useOnlineUsers";
import { FiSend } from "react-icons/fi";
import { fetchMessages, fetchUnreadCount, ChatMessage, resetMessages } from "@/app/store/chatSlice";


const ProjectInformation = ({ handleLogout }: { handleLogout: () => Promise<void> }) => {
    const [isInviteMember, setIsInviteMember] = useState(false);
    const [isEditTags, setIsEditTags] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [input, setInput] = useState("");
    const [userName, setUserName] = useState<string | null>(null);
    const [showOptions, setShowOptions] = useState(false);
    const dispatch = useAppDispatch();

    //프로젝트 정보 가져오기
    const selectedProject = useAppSelector((state) => state.selectedProject.selectedProject);
    const projectId = selectedProject?.id;
    const { messages: websocketMessages, setMessages, sendMessage } = useChatWebSocket(showChat);
    //팀원 목록 가져오기
    const members = useAppSelector((state) => state.team.members);
    const loading = useAppSelector((state) => state.team.loading);
    const error = useAppSelector((state) => state.team.error);

    //읽지 않은 메시지
    const unreadCount = useSelector((state: RootState) => state.chat.unreadCount);

    //접속 중인 사용자 목록
    const onlineUsers = useOnlineUsers();

    //로그아웃 및 회원 탈퇴
    const toggleOptions = () => {
        setShowOptions(prev => !prev);
    };

    const handleProjectLogout = async () => {
        setShowOptions(false);
    
    
        if (handleLogout) {
            await handleLogout();  
        } else {
            console.warn("⚠ handleLogout이 `undefined`입니다. props가 제대로 전달되지 않았을 가능성!");
        }

    };

    const handleDeleteAccount = () => {
        setShowOptions(false);
    };

    //사용자 이름 가져오기
    useEffect(() => {
        const storedUser = localStorage.getItem("userInfo");
        if (storedUser) {
            try {
                const userData = JSON.parse(storedUser);
                setUserName(userData.nickname);
            } catch (error) {
                console.error("사용자 정보가 없습니다:", error);
            }
        }
    }, []);

    //메시지 내용 가져오기
    useEffect(() => {
        if (showChat && projectId) { 
            console.log("✅ 채팅창 열림: 메시지 불러오기");

            setMessages([]); 
            dispatch(resetMessages()); 
            dispatch(fetchMessages({ projectId })); 
        }
    }, [dispatch, projectId, showChat]); 


    const reduxMessages = useAppSelector((state) => state.chat.messages) || [];

    const allMessages = [...reduxMessages, ...(showChat ? websocketMessages : [])].flat();

    //오래된 순부터 정렬
    const processedMessages = allMessages.map((msg) => {
        if (typeof msg !== "string" && !msg.createdAt) {
            return { ...msg, createdAt: new Date().toISOString() }; 
        }
        return msg;
    });
    
    const sortedMessages = processedMessages
        .filter(
            (msg): msg is ChatMessage =>
                typeof msg !== "string" &&
                msg.content !== null &&
                msg.content !== undefined
        )
        .sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );    

    // 🔹 접속 중인 사용자를 상단에 정렬하는 임시 로직 추가
    const sortedUsers = members
    .map((user) => {
        const isOnline = onlineUsers.some((onlineUser) => onlineUser.id === user.email);
        return {
            ...user,
            isOnline,
        };
    })
    .sort((a, b) => (b.isOnline ? 1 : -1))
  
  

    //팀원 초대
    const openInvitePopup = () => setIsInviteMember(true);
    const closeInvitePopup = () => setIsInviteMember(false);

    //태그 편집 팝업
    const openEditTagPopup = () => setIsEditTags(true);
    const closeEditTagPopup = () => setIsEditTags(false);

    // 채팅창 열기&닫기
    const openChat = () => setShowChat(true);
    const closeChat = () => setShowChat(false);

    const handleSend = () => {
        if (!input.trim()) return; 
    
        console.log(`📤 메시지 전송 요청: ${input}`);
    
        sendMessage(input); 
        setInput("");
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
                            <li key={user.email} className={styles.userItem}>
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
                            {unreadCount > 0 && (
                                <span className={styles.unreadBadge}>
                                    {unreadCount > 99 ? "99+" : unreadCount}
                                </span>
                            )}

                        </div>
                        <h2 className={styles.userName} onClick={toggleOptions}>{userName ? userName : "로그인해주세요"}</h2>

                        {/* 로그아웃 및 회원탈퇴 */}
                        {showOptions && (
                            <div className={styles.memberOptions}>
                                <button className={styles.logoutBtn} onClick={handleProjectLogout}>로그아웃</button>
                                <button className={styles.deleteAccountBtn} onClick={handleDeleteAccount}>회원탈퇴</button>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                // 채팅창
                <div className={styles.chatContainer}>
                    <div className={styles.firstContainer}>
                        <h1>{selectedProject ? selectedProject.title : ""}</h1>
                    </div>
                    <div className={styles.closeContainer}>
                        <button onClick={closeChat} className={styles.closeChatBtn}>
                            X
                        </button>
                    </div>
                    <div className={styles.chatMessageContainer}>
                    {allMessages.length === 0 ? (
                        <p></p>
                    ) : (
                        sortedMessages.map((msg: any, index: number) => {
                            const storedUser = JSON.parse(localStorage.getItem("userInfo") || "{}");
                            const isMyMessage = storedUser.email && msg.sender?.email && storedUser.email === msg.sender.email;

                            const formattedDate = new Date(msg.createdAt).toLocaleString("ko-KR", {
                                month: "2-digit",
                                day: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: false,
                              });
                        
                            return (
                            <div
                                key={index}
                                className={`${styles.chatMessage} ${
                                    isMyMessage ? styles.myMessage : styles.otherMessage
                                }`}
                                >
                                 <div className={styles.bubbleContainer}>
                                    {/* 읽지 않은 메시지 수를 왼쪽 또는 오른쪽에 배치 */}
                                    {!isMyMessage && msg.unreadCount > 0 && (
                                    <span className={`${styles.unreadCount} ${styles.unreadRight}`}>
                                        {msg.unreadCount}
                                    </span>
                                    )}

                                    {/* 내 메시지일 경우 unreadCount를 왼쪽에 표시 */}
                                    {isMyMessage && msg.unreadCount > 0 && (
                                    <span className={`${styles.unreadCount} ${styles.unreadLeft}`}>
                                        {msg.unreadCount}
                                    </span>
                                    )}

                                    <div className={styles.bubble}>
                                        <p>{msg.content}</p>
                                        <span
                                        className={`${styles.messageTime} ${
                                            isMyMessage ? styles.myMessageTime : ""
                                        }`}
                                        >
                                        {formattedDate}
                                        </span>
                                    </div>
                                </div>
                                {!isMyMessage && msg.sender?.nickname && (
                                    <span className={styles.senderName}>{msg.sender.nickname}</span>
                                )}
                            </div>
                            );
                        })                        
                    )}
                    </div>
                    <div className={styles.sendContainer}>
                        <input className={styles.chatInput} value={input} 
                        onChange={(e)=> setInput(e.target.value)} 
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()} 
                        placeholder="메시지 입력" />
                        <button className={`${styles.sendButton} ${input ? styles.active : ""}`} onClick={handleSend}>
                            <FiSend className={`${styles.sendIcon} ${input ? styles.iconActive : ""}`} size={24}/>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectInformation;