import React, {useState} from "react";
import styles from './tagEditPopup.module.css';

interface PopupProps {
    isOpen: boolean;
    onClose: () => void;
}  

const TagEditPopup: React.FC<PopupProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    const [tag, setTag] = useState("")
    const [tags, setTags] = useState<string[]>([]);

    //태그 테스트 데이터(*후에 수정)
    const [exampleTags, setExampleTags] = useState([
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
    ]);

    const handleTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTag(e.target.value);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === " " && tag.trim()) {
            //스페이스바를 눌렀을 때 입력 태그 추가
            const newTag = {
                id: exampleTags.length + 1, // 새로운 id
                name: tag.trim(), // 입력된 태그 이름
            };
    
            // 기존 태그에 추가
            setExampleTags([...exampleTags, newTag]);
    
            //추가 후 입력 필드 초기화
            setTag("");
        }
    };

    //태그 삭제
    const removeTag = (indexToRemove: number) => {
        setExampleTags(exampleTags.filter((_, id) => id !== indexToRemove));
    }

    return(
        <div className={styles.EditTagsPopupOverlay} onClick={onClose}>
            <div className={styles.EditTagspopup} onClick={(e) => e.stopPropagation()}>
                <button className={styles.EditTagsCloseBtn} onClick={onClose}>
                X
                </button>
                <h1 className={styles.EditTagsMember}>태그 편집</h1>
                <input
                    type="text"
                    value={tag}
                    placeholder="태그 입력"
                    onChange={handleTagChange}
                    onKeyDown={handleKeyDown}
                    className={styles.addTag}
                />
                <h3 className={styles.addTagDescription}>스페이스바로 태그 구분</h3>
                <ul className={styles.projecttags}>
                    {exampleTags.map((tag, id) => (
                        <li key={tag.id} className={styles.tag}>
                            {tag.name}
                            <span onClick={() => removeTag(id)} className={styles.removeTag}>
                                &times;
                            </span>
                        </li>
                    ))}
                </ul>
                <p className={styles.tagNotice}>태그는 최소한 3개 이상 설정해주세요.</p>
                <button className={styles.editCompleteBtn}>완료</button>
            </div>
        </div>
    );
};

export default TagEditPopup;