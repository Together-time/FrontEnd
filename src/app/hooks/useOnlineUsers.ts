import { useEffect, useState, useRef } from "react";
import { useAppDispatch, useAppSelector, RootState } from "@/app/store/store";

interface User {
    id: string;
    nickname: string;
    email?: string;
    isOnline: boolean;
}

export const useOnlineUsers = () => {
    const selectedProject = useAppSelector((state) => state.selectedProject.selectedProject);
    const projectId = selectedProject?.id;
    const [users, setUsers] = useState<User[]>([]);
    const socketRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        if (!projectId) {
            console.warn("🚫 프로젝트 ID가 없습니다. Online WebSocket을 연결하지 않습니다.");
            return;
        }

        const wsUrl = `ws://localhost:8080/ws/online-status?projectId=${projectId}`;
        console.log(`🔗 Online WebSocket 연결 시도... ${wsUrl}`);

        if (socketRef.current) {
            return;
        }

        const socket = new WebSocket(wsUrl);
        socketRef.current = socket;

        socket.onopen = () => {
        };

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
        
                if (data.onlineUsers) {
                    console.log("📌 현재 접속 중인 모든 사용자:", data.onlineUsers);
        
                    // 기존 유저 목록을 한 번에 업데이트
                    setUsers(data.onlineUsers.map((email: string) => ({
                        id: email,
                        nickname: email, 
                        isOnline: true,
                    })));
                } 
                
                if (data.email) {
                    setUsers((prevUsers) => {
                        const existingUser = prevUsers.find((user) => user.id === data.email);
                        if (existingUser) {
                            return prevUsers.map((user) =>
                                user.id === data.email ? { ...user, isOnline: data.isOnline } : user
                            );
                        } else {
                            console.log("현재 접속 중인 사용자 추가:", data.email);
                            return [...prevUsers, { id: data.email, nickname: data.email, isOnline: data.isOnline }];
                        }
                    });
                }
            } catch (error) {
                console.error("🚨 Online WebSocket 메시지 처리 오류:", error);
            }
        };
        

        socket.onerror = (error) => {
            console.error("🚨 Online WebSocket 오류 발생:", error);
        };

        socket.onclose = () => {
            socketRef.current = null;

            // 자동 재연결
            setTimeout(() => {
                socketRef.current = new WebSocket(wsUrl);
            }, 3000);
        };

        return () => {
            if (socketRef.current) {
                socketRef.current.close();
                socketRef.current = null;
            }
        };
    }, [projectId]);

    return users;
};

export default useOnlineUsers;
