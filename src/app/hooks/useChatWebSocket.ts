import { useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { useSelector } from "react-redux";
import { useAppDispatch, useAppSelector, RootState } from "@/app/store/store";


const useChatWebSocket = () => {
    const dispatch = useAppDispatch();
    const selectedProject = useAppSelector((state) => state.selectedProject.selectedProject);
    const projectId = selectedProject?.id; 

    const [messages, setMessages] = useState<string[]>([]);
    const socketRef = useRef<WebSocket | null>(null);

    console.log("선택한 프로젝트 ID: ", projectId);

    useEffect(() => {
        if (!process.env.NEXT_PUBLIC_API_URL) {
            console.error("🚨 WebSocket URL이 설정되지 않았습니다.");
            return;
        }
    
        if (!projectId) {
            console.warn("⚠ 프로젝트 ID가 없습니다. WebSocket을 연결하지 않습니다.");
            return;
        }
    
        console.log(`🔗 WebSocket 연결 시도 중... projectId: ${projectId}`);
    
        const socket = new WebSocket(`${process.env.NEXT_PUBLIC_API_URL}/ws/chat?projectId=${projectId}`);

        socketRef.current = socket;

        socket.onopen = () => {
            console.log(`✅ WebSocket 연결 성공! (projectId: ${projectId})`);
            
            const authMessage = JSON.stringify({ });
            socket.send(authMessage);
            console.log("📤 인증 메시지 전송:", authMessage);
        };
    
        socket.onmessage = (event) => {
            console.log(`📩 메시지 수신: ${event.data}`);
            setMessages((prev) => [...prev, JSON.parse(event.data)]);
        };
    
        socket.onerror = (error) => {
            console.error("🚨 WebSocket 오류 발생:", error);
        };
    
        socket.onclose = () => {
            console.log("🔴 WebSocket 연결이 닫혔습니다.");
        };
    
        return () => {
            if (socketRef.current) {
                console.log("🛑 WebSocket 연결 종료");
                socketRef.current.close();
            }
        };
    }, [projectId]);
    

    const sendMessage = (msg: string) => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            const messageData = {
                content: msg,
                projectId,
            };
            socketRef.current.send(JSON.stringify(messageData));
            console.log(`📤 메시지 전송: ${JSON.stringify(messageData)}`);
        } else {
            console.error("🚨 WebSocket이 연결되지 않았습니다.");
        }
    };

    return { messages, sendMessage };
};

export default useChatWebSocket;

