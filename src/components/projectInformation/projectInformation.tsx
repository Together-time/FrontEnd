"use client";

import React, { useState } from "react";
import InvitePopup from '@/components/common/inviteMember';
import EditTagPopup from './tagEditPopup';
import { FaRegCommentDots } from "react-icons/fa";
import styles from "./projectInformation.module.css";


const ProjectInformation: React.FC = () => {
    const [isInviteMember, setIsInviteMember] = useState(false);
    const [isEditTags, setIsEditTags] = useState(false);
    const [showChat, setShowChat] = useState(false);

    //사용자 테스트 데이터(*후에 수정)
    const users = [
        { id: 1, name: '이사용자는이름이엄청나게깁니다많이많이길어요', isOnline: true },
        { id: 2, name: '사용자2', isOnline: false },
        { id: 3, name: '사용자3', isOnline: true },
        { id: 4, name: '사용자4', isOnline: false },
        { id: 5, name: '사용자5', isOnline: true },
        { id: 6, name: '사용자6', isOnline: false },
    ];

    //접속 중인 사용자 상단에 정렬
    const sortedUsers = [...users].sort((a, b) => Number(b.isOnline) - Number(a.isOnline));

    //팀원 초대
    const openInvitePopup = () => setIsInviteMember(true);
    const closeInvitePopup = () => setIsInviteMember(false);

    //태그 테스트 데이터(*후에 수정)
    const tags = [
        { id: 1, name: '경주여행' },
        { id: 2, name: '경주여행' },
        { id: 3, name: '경주여행' },
        { id: 4, name: '경주여행' },
        { id: 5, name: '경주여행' },
        { id: 6, name: '경주여행' },
        { id: 7, name: '경주여행' },
        { id: 8, name: '경주여행' },
        { id: 9, name: '경주여행' },
        { id: 10, name: '경주여행' },
        { id: 11, name: '경주여행' },
        { id: 12, name: '경주여행' },
        { id: 13, name: '경주여행' },
        { id: 14, name: '경주여행' },
        { id: 15, name: '경주여행' },
        { id: 16, name: '경주여행' },
        { id: 17, name: '경주여행' },
        { id: 18, name: '경주여행' },
        { id: 19, name: '경주여행' },
    ]

    //태그 편집 팝업
    const openEditTagPopup = () => setIsEditTags(true);
    const closeEditTagPopup = () => setIsEditTags(false);

    //읽지 않은 메시지 수
    const unreadMessages = 3;

    // 채팅창 열기
    const openChat = () => setShowChat(true);

    // 채팅창 닫기
    const closeChat = () => setShowChat(false);

    return(
<div>
            {!showChat ? (
                // 기본 섹션
                <div className={styles.informationContainer}>
                    <div className={styles.firstContainer}>
                        <h1>대전 가요~</h1>
                    </div>
                    <div className={styles.secondContainer}>
                        <h3>현재 참여 중인 인원</h3>
                        <ul className={styles.userList}>
                            {sortedUsers.map((user) => (
                                <li key={user.id} className={styles.userItem}>
                                    <span>{user.name}</span>
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
                            {tags.map((tag) => (
                                <li key={tag.id} className={styles.tag}>
                                    {tag.name}
                                </li>
                            ))}
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
                        <h2>뀽☆</h2>
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
                    
                    </div>
                    <h2>채팅창</h2>
                </div>
            )}
        </div>
    );
};

export default ProjectInformation;