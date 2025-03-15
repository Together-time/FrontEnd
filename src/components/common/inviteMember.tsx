import React, {useState, useEffect} from "react";
import axios from "axios";
import styles from './inviteMember.module.css';
import { RootState, useAppDispatch, useAppSelector } from '@/app/store/store';
import { fetchMembers, inviteMember } from "@/app/store/teamSlice";

interface PopupProps {
    isOpen: boolean;
    onClose: () => void;
}  

type Member = {
    id: number;
    nickname: string;
    email?:string;
};  

const InvitePopup: React.FC<PopupProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    const [name, setName] = useState("");
    const dispatch = useAppDispatch();
    //사용자 검색
    const [keyword, setKeyword] = useState("");
    const [searchResults, setSearchResults] = useState<Member[]>([]);
    const [selectedMember, setSelectedMember] = useState<Member | null>(null);
    const [isInviting, setIsInviting] = useState(false);
    const selectedProject = useAppSelector((state:RootState) => state.selectedProject.selectedProject);
    const { searchedMembers, loading } = useAppSelector((state: RootState) => state.team);


    //실시간 검색 요청
    useEffect(() => {
        if (keyword.trim() !== "") {
            dispatch(fetchMembers(keyword));
        }
    }, [keyword, dispatch]);
      

    const handleSelectMember = (member:any) => {
        setKeyword(`${member.nickname} (${member.email})`);
        setSelectedMember({
            id: member.id,
            nickname: member.nickname,
            email: member.email,
        });
        setSearchResults([]);
      };

    //팀원 초대 요청
    const handleInviteMember = async () => {
        if (!selectedMember || !selectedMember.id) {
            alert("초대할 사용자의 정보가 올바르지 않습니다.");
            return;
        }

        if (!selectedProject?.id) {
            alert("선택된 프로젝트 정보가 없습니다.");
            return;
        }

        setIsInviting(true);

        try {
            await dispatch(
                inviteMember({
                    member: selectedMember, 
                    projectId: Number(selectedProject.id),
                })
            ).unwrap();

            alert(`${selectedMember.nickname}님이 초대되었습니다!`);
            setSelectedMember(null);
            setKeyword("");
        } catch (error) {
            console.error("팀원 초대 오류:", error);
            alert("초대에 실패했습니다.");
        } finally {
            setIsInviting(false);
        }
    };
    

    return(
        <div className={styles.addMemberPopupOverlay} onClick={onClose}>
            <div className={styles.addMemberpopup} onClick={(e) => e.stopPropagation()}>
                <button className={styles.addMemberCloseBtn} onClick={onClose}>
                X
                </button>
                <p className={styles.addMember}>초대하기</p>

                <div className={styles.searchMemberContainer}>
                    <input
                        type="text"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        className={styles.searchMember}
                    />
                    <button 
                        className={`${styles.searchMemberBtn} ${selectedMember ? styles.selected : ""}`}
                        disabled={!selectedMember || isInviting}
                        onClick={handleInviteMember}
                    >
                        초대하기
                    </button>
                </div>

                {/* 검색 결과 표시 */}
                <div className={styles.searchResults}>
                {loading ? (
                    <p>검색 중...</p>
                ) : searchResults.length > 0 ? (
                    searchResults.map((member) => (
                    <div key={member.id} 
                    className={styles.searchResultItem}
                    onClick={() => handleSelectMember(member)}>
                        <p>{member.nickname} ({member.email})</p>
                    </div>
                    ))
                ) : (
                    keyword.trim() !== "" && <p>검색 결과 없음</p>
                )}
                </div>
            </div>
        </div>
    );
};

export default InvitePopup;