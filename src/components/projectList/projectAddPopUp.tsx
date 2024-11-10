import React, {useState} from "react";
import InvitePopup from '@/components/common/inviteMember';
import styles from './projectAddPopUp.module.css';

interface PopupProps {
    isOpen: boolean;
    onClose: () => void;
}  

const projectAddPopUp: React.FC<PopupProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    const [title, setTitle] = useState("");
    const [tag, setTag] = useState("")
    const [tags, setTags] = useState<string[]>([]);
    const [isInviteMember, setIsInviteMember] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value);
    };

    const handleTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTag(e.target.value);
    };

    //예시 태그
    const exampleTags = [
        {id: 1, name: '제주도'},
        {id: 2, name: '뚜벅이'},
        {id: 3, name: '3박4일'},
    ];


    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === " " && tag.trim()) {
            //스페이스바를 눌렀을 때 입력 태그 추가
            //추가 후 입력 필드 초기화
            setTags([...tags, tag.trim()]);
            setTag("");
        }
    };

    //태그 삭제
    const removeTag = (indexToRemove: number) => {
        setTags(tags.filter((_, index) => index !== indexToRemove));
    }

    //팀원 초대
    const openInvitePopup = () => setIsInviteMember(true);
    const closeInvitePopup = () => setIsInviteMember(false);

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
                        <button onClick={openInvitePopup} className={styles.addInviteBtn}>+</button>


                        {/* 팀원 초대 팝업 */}
                        {isInviteMember && (
                            <InvitePopup isOpen={isInviteMember} onClose={closeInvitePopup} />
                        )}
                    </div>

                    <div className={styles.addProjectBtnContainer}>
                        <button className={styles.addProjectBtn}>생성하기</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default projectAddPopUp;