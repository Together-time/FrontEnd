import React, {useState} from "react";
import styles from './inviteMember.module.css';

interface PopupProps {
    isOpen: boolean;
    onClose: () => void;
}  

const InvitePopup: React.FC<PopupProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    const [name, setName] = useState("");

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value);
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
                        value={name}
                        onChange={handleNameChange}
                        className={styles.searchMember}
                    />
                    <button className={styles.searchMemberBtn}>초대하기</button>
                </div>
            </div>
        </div>
    );
};

export default InvitePopup;