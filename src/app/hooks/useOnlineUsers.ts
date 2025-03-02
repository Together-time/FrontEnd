import { useEffect, useState, useRef } from "react";
import { useAppDispatch, useAppSelector, RootState } from "@/app/store/store";

interface User {
    id: string;
    nickname: string;
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
            console.log("✅ 기존 Online WebSocket이 존재함. 새로 생성하지 않음.");
            return;
        }

        const socket = new WebSocket(wsUrl);
        socketRef.current = socket;

        socket.onopen = () => {
            console.log("✅ Online WebSocket 연결 성공");
        };

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log("📩 Online WebSocket 메시지 수신:", data);

                if (data.email) {
                    setUsers((prevUsers) => {
                        const existingUser = prevUsers.find((user) => user.id === data.email);
                        if (existingUser) {
                            return prevUsers.map((user) =>
                                user.id === data.email ? { ...user, isOnline: data.isOnline } : user
                            );
                        } else {
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
            console.log("🔴 Online WebSocket 연결 종료");
            socketRef.current = null;

            // 자동 재연결
            setTimeout(() => {
                console.log("♻️ Online WebSocket 재연결 시도...");
                socketRef.current = new WebSocket(wsUrl);
            }, 3000);
        };

        return () => {
            if (socketRef.current) {
                console.log("🛑 Online WebSocket 연결 종료");
                socketRef.current.close();
                socketRef.current = null;
            }
        };
    }, [projectId]);

    return users;
};

export default useOnlineUsers;
