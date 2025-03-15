import React, {useState,useEffect} from "react";
import styles from './tagEditPopup.module.css';
import axios from "axios";
import { useAppDispatch, useAppSelector } from '@/app/store/store';
import { fetchProjectById } from '@/app/store/selectedProjectSlice';
import { fetchUpdateProjectTags } from "@/app/store/selectedProjectSlice";
import { RootState } from "@/app/store/store";

interface PopupProps {
    isOpen: boolean;
    onClose: () => void;
}  

const TagEditPopup: React.FC<PopupProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    const dispatch = useAppDispatch();

    // Redux에서 선택된 프로젝트 가져오기
    const selectedProject = useAppSelector((state: RootState) => state.selectedProject.selectedProject);
    const projectId = selectedProject?.id;

    // 태그 입력 상태 (입력 중인 단일 태그)
    const [tag, setTag] = useState("");

    // 태그 리스트 상태 (Redux에서 가져온 데이터를 useState로 관리)
    const [tags, setTags] = useState<string[]>([]);

    useEffect(() => {
        if (Array.isArray(selectedProject?.tags)) {  
            setTags([...selectedProject.tags]); 
        } else {
            setTags([]); 
        }
    }, [selectedProject]);

    const handleTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTag(e.target.value);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === " " && tag.trim()) {
            if (!tags.some(existingTag => existingTag === tag.trim())) {
                setTags([...tags, tag.trim()]);
            }
    
            setTag("");
        }
    };
    
    // 태그 삭제 함수
    const removeTag = (indexToRemove: number) => {
        setTags(tags.filter((_, index) => index !== indexToRemove));
    };

    //태그 수정 버튼
    const handleSaveTags = async () => {
        if (!selectedProject) return;
    
        try {
            await dispatch(fetchUpdateProjectTags({ projectId: selectedProject.id, tags })).unwrap();
    
            // 프로젝트 데이터 재발행
            await dispatch(fetchProjectById(selectedProject.id)).unwrap();
    
            alert("태그가 성공적으로 수정되었습니다!");
            onClose();
        } catch (error) {
            console.error("태그 수정 오류:", error);
            alert("태그 수정에 실패했습니다.");
        }
    };
    
    

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
                {/* 태그 리스트 */}
                <ul className={styles.projecttags}>
                    {tags.map((tag, index) => (
                        <li key={index} className={styles.tag}>
                            {tag}
                            <span onClick={() => removeTag(index)} className={styles.removeTag}>
                                &times;
                            </span>
                        </li>
                    ))}
                </ul>
                <p className={styles.tagNotice}>태그는 최소한 3개 이상 설정해주세요.</p>
                <button className={styles.editCompleteBtn} onClick={handleSaveTags}>완료</button>
            </div>
        </div>
    );
};

export default TagEditPopup;