const baseUrl = import.meta.env.VITE_API_SERVICE_URL;

export enum ChatRoleEnum {
    User = 'user',
    Assistant = 'assistant'
}

export type ChatSessionMessage = {
    id: string,
    role: ChatRoleEnum
    content: string
    createdAt: string
}

export type ChatSessionQuestion = {
    question: string
}

export type ChatSessionAnswer = {
    answer: string
    remaining: number
}

export const getChatSession = async (sessionId: number) => {
    return await fetch(`${baseUrl}/api/chat/${sessionId}`).then(res => res.json())
}

export const postChatSession = async (sessionId: number, body: ChatSessionQuestion) => {
    return await fetch(`${baseUrl}/api/chat/${sessionId}`, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(res => res.json())
}