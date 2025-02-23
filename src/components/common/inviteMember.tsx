import React, {useState, useEffect} from "react";
import axios from "axios";
import styles from './inviteMember.module.css';
import { RootState } from "@/app/store/store";
import { useAppSelector } from '@/app/store/store';

interface PopupProps {
    isOpen: boolean;
    onClose: () => void;
}  

// ✅ Member 타입을 명시
type Member = {
    id: string;
    nickname: string;
    email: string;
};  

const InvitePopup: React.FC<PopupProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    const [name, setName] = useState("");
    //사용자 검색
    const [keyword, setKeyword] = useState("");
    const [searchResults, setSearchResults] = useState<Member[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedMember, setSelectedMember] = useState<{ nickname: string; email: string } | null>(null);
    const [isInviting, setIsInviting] = useState(false);
    const selectedProject = useAppSelector((state:RootState) => state.selectedProject.selectedProject);

    //실시간 검색 요청
    const fetchMembers = async () => {
        if(keyword.trim() === "") {
            setSearchResults([]);
            return;
        }

        setLoading(true);
      
        try {
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/api/member`,
            {
              params: { keyword },
              withCredentials: true,
            }
          );
      
          setSearchResults(response.data);
        } catch (error) {
          console.error("멤버 검색 오류:", error);
        } finally {
          setLoading(false);
        }
    };

    useEffect(() => {
        fetchMembers();
    }, [keyword]);
      

    const handleSelectMember = (member:any) => {
        setKeyword(`${member.nickname} (${member.email})`);
        setSelectedMember(member);
        setSearchResults([]);
      };

    //팀원 초대 요청
    const handleInviteMember = async () => {
        if (!selectedMember) return;
    
        setIsInviting(true);
    
        try {
            const projectId = Number(selectedProject?.id);
    
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/team`,
                {
                    member: selectedMember, 
                    projectId: projectId
                },
                {
                    withCredentials: true
                }
            );
    
            if (response.status === 200) {
                alert(`${selectedMember.nickname}님이 초대되었습니다!`);
                setSelectedMember(null);
                setKeyword("");
            } else {
                alert("초대에 실패했습니다.");
            }
        } catch(error) {
            console.error("팀원 초대 오류: ", error);
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