import React, {useState} from "react";
import InvitePopup from '@/components/common/inviteMember';
import styles from './projectAddPopUp.module.css';
import { useAppDispatch } from "@/app/store/store";
import { fetchCreateProject, fetchProjects } from "@/app/store/projectSlice";

interface ProjectCommand {
    title: string;
    tags: string[];
}

interface PopupProps {
    isOpen: boolean;
    onClose: () => void;
}  

const projectAddPopUp: React.FC<PopupProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    const dispatch = useAppDispatch();
    const [title, setTitle] = useState("");
    const [tag, setTag] = useState("")
    const [tags, setTags] = useState<string[]>([]);
    const [isInviteMember, setIsInviteMember] = useState(false);

    const jwtToken = localStorage.getItem("jwtToken");

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value);
    };

    const handleTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTag(e.target.value);
    };


    // 예시 태그
    const exampleTags = [
        { id: 1, name: '제주도' },
        { id: 2, name: '뚜벅이' },
        { id: 3, name: '3박4일' },
    ];

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === ' ' && tag.trim()) {
            // 스페이스바를 눌렀을 때 입력 태그 추가
            setTags([...tags, tag.trim()]);
            setTag('');
        }
    };

    const removeTag = (indexToRemove: number) => {
        setTags(tags.filter((_, index) => index !== indexToRemove));
    };

    const openInvitePopup = () => setIsInviteMember(true);
    const closeInvitePopup = () => setIsInviteMember(false);

    // 프로젝트 생성 요청
    const handleCreateProject = async () => {
        if (!title.trim() || tags.length < 3) {
            alert('제목을 입력하고 최소 3개의 태그를 추가해주세요.');
            return;
        }

        try {
            await dispatch(fetchCreateProject({ title, tags, members: [] })).unwrap();
            await dispatch(fetchProjects()).unwrap();
            alert('프로젝트가 성공적으로 생성되었습니다.');
            onClose();
        } catch (error) {
            console.error('프로젝트 생성 오류:', error);
            alert('오류가 발생했습니다. 다시 시도해주세요.');
        }
    };

    return (
        <div className={styles.projectAddPopupOverlay} onClick={onClose}>
            <div className={styles.projectAddpopup} onClick={(e) => e.stopPropagation()}>
                <button className={styles.projectAddCloseBtn} onClick={onClose}>
                    X
                </button>

                {/* 제목 입력 */}
                <div>
                    <input
                        type="text"
                        value={title}
                        onChange={handleInputChange}
                        placeholder="시간표 제목"
                        className={styles.addName}
                    />
                </div>
                <div className={styles.projectAddTagContainer}>
                    <h1>태그</h1>
                    <input
                        type="text"
                        value={tag}
                        placeholder="태그 입력"
                        onChange={handleTagChange}
                        onKeyDown={handleKeyDown}
                        className={styles.addTag}
                    />
                    <h3 className={styles.addTagDescription}>스페이스바로 태그 구분</h3>

                    {/* 태그 표시 컨테이너 */}
                    <div className={styles.addTagContainer}>
                        {tags.map((tag, index) => (
                            <div key={index} className={styles.tag}>
                                {tag}
                                <span className={styles.removeTag} onClick={() => removeTag(index)}>
                                    &times;
                                </span>
                            </div>
                        ))}
                    </div>

                    <p className={styles.exampleTag}>예시)</p>
                    {exampleTags.map((exampleTag) => (
                        <div key={exampleTag.id} className={`${styles.tag} ${styles.tagMargin}`}>
                            {exampleTag.name}
                            <span className={styles.exampleRemoveTag}>
                                &times;
                            </span>
                        </div>
                    ))}
                    <p className={styles.tagNotice}>태그는 최소한 3개 이상 설정해주세요.</p>

                    {/* 팀원 초대 컨테이너 */}
                    <div className={styles.inviteContainer}>
                        <h1>팀원 초대</h1>
                        <button onClick={openInvitePopup} className={styles.addInviteBtn}>
                            +
                        </button>

                        {/* 팀원 초대 팝업 */}
                        {isInviteMember && (
                            <InvitePopup isOpen={isInviteMember} onClose={closeInvitePopup} />
                        )}
                    </div>

                    <div className={styles.addProjectBtnContainer}>
                        <button onClick={handleCreateProject} className={styles.addProjectBtn}>
                            생성하기
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default projectAddPopUp;