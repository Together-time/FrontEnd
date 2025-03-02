import { useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { useSelector } from "react-redux";
import { useAppDispatch, useAppSelector, RootState } from "@/app/store/store";
import { updateUnreadCount } from "@/app/store/chatSlice";


const useChatWebSocket = (showChat: boolean) => {
    const dispatch = useAppDispatch();
    const selectedProject = useAppSelector((state) => state.selectedProject.selectedProject);
    const projectId = selectedProject?.id;

    const [messages, setMessages] = useState<any[]>([]);
    const socketRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        if (!projectId || !showChat) {
            console.warn("🚫 프로젝트 ID 없음 또는 채팅창이 열려있지 않음. WebSocket을 연결하지 않습니다.");
            return;
        }

        if (socketRef.current) {
            console.log("✅ 기존 Chat WebSocket이 존재함. 새로 생성하지 않음.");
            return;
        }

        const wsUrl = `ws://localhost:8080/ws/chat?projectId=${projectId}`;
        console.log(`🔗 Chat WebSocket 연결 시도... ${wsUrl}`);

        const socket = new WebSocket(wsUrl);
        socketRef.current = socket;

        socket.onopen = () => {
            console.log(`✅ Chat WebSocket 연결 성공! (projectId: ${projectId})`);
        };

        socket.onmessage = (event) => {
            console.log(`📩 Chat WebSocket 메시지 수신: ${event.data}`);

            const receivedMessage = JSON.parse(event.data);

            if (receivedMessage.type === "read") {
                console.log(`📌 [읽음 처리] 메시지 ${receivedMessage.messageId}의 unreadCount 업데이트: ${receivedMessage.unreadCount}`);
                setMessages((prevMessages) =>
                    prevMessages.map((msg) =>
                        msg.id === receivedMessage.messageId ? { ...msg, unreadCount: receivedMessage.unreadCount } : msg
                    )
                );
                dispatch(updateUnreadCount(receivedMessage));
            } else {
                setMessages((prev) => [...prev, receivedMessage]);
            }

            console.log("🚩 Redis에서 전달된 메시지 데이터:", receivedMessage);
        };

        socket.onerror = (error) => {
            console.error("🚨 Chat WebSocket 오류 발생:", error);
        };

        socket.onclose = (event) => {
            console.log("🔴 Chat WebSocket 연결 종료. 코드:", event.code, "이유:", event.reason);
            socketRef.current = null;
        };

        return () => {
            if (socketRef.current) {
                console.log("🛑 Chat WebSocket 연결 종료");
                socketRef.current.close();
                socketRef.current = null;
            }
        };
    }, [projectId, showChat]);

    // ✅ showChat이 true가 될 때 기존 메시지 초기화
    useEffect(() => {
        if (showChat) {
            console.log("🧹 채팅 메시지 초기화");
            setMessages([]);
        }
    }, [showChat]);

    const sendMessage = (msg: string) => {
        if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
            console.error("🚨 Chat WebSocket이 연결되지 않았습니다. 재연결 시도 중...");
            return;
        }

        const storedUser = localStorage.getItem("userInfo");
        if (!storedUser) {
            console.error("❌ 사용자 정보가 없습니다.");
            return;
        }

        const userInfo = JSON.parse(storedUser);
        const messageData = {
            content: msg,
            sender: { email: userInfo.email, nickname: userInfo.nickname },
            projectId,
        };

        console.log(`📤 메시지 전송: ${JSON.stringify(messageData)}`);
        socketRef.current.send(JSON.stringify(messageData));
    };

    return { messages, setMessages, sendMessage };
};

export default useChatWebSocket;