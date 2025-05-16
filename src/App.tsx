import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Divider, Flex, FloatButton, type GetRef, message as antdMessage } from 'antd';
import { MessageOutlined, OpenAIFilled, UserOutlined } from '@ant-design/icons';
import { Bubble, Conversations, Sender, useXAgent, useXChat, XProvider } from '@ant-design/x';
import type { MessageInfo } from '@ant-design/x/es/use-x-chat';
import type { RolesType } from '@ant-design/x/es/bubble/BubbleList';
import { ChatRoleEnum, getChatSession, postChatSession, type ChatSessionMessage, type ChatSessionQuestion } from './api/chat';
import "./App.css"

const roles: RolesType = {
    [ChatRoleEnum.Assistant]: {
        placement: 'start',
        avatar: { icon: <OpenAIFilled />, style: { background: '#0fa37f' } },
        typing: { step: 5, interval: 20 },
    },
    [ChatRoleEnum.User]: {
        placement: 'end',
        avatar: { icon: <UserOutlined />, style: { background: '#ef6c00' } },
    },
};

const App = () => {
    const senderRef = useRef<GetRef<typeof Sender>>(null);
    const [content, setContent] = useState('');
    const [sessionId] = useState(44);

    const { data: sessionMessages } = useQuery<ChatSessionMessage[]>({
        queryKey: ['session', sessionId],
        queryFn: () => getChatSession(sessionId)
    })

    const { mutateAsync } = useMutation({
        mutationFn: (body: ChatSessionQuestion) => postChatSession(sessionId, body),
    });


    const [agent] = useXAgent<string, { message: string }, ChatSessionMessage>({
        request: async ({ message }, { onSuccess, onError }) => {
            try {
                const response = await mutateAsync({ question: message });
                onSuccess([response.answer]);
            } catch (err) {
                onError(err as Error);
                antdMessage.error('Failed to send message');
            }
        },
    });

    const { onRequest, messages, setMessages } = useXChat<string>({
        agent,
        defaultMessages: [],
        requestPlaceholder: 'Thinking...',
        requestFallback: 'Something went wrong. Try again later.',
    });

    useEffect(() => {
        const initialMessages: MessageInfo<string>[] = [{
            id: '123',
            message: 'Hello, 👋. How can I help you?',
            status: 'success'
        }]

        if (!sessionMessages?.length) {
            return setMessages(initialMessages)
        };

        setMessages(initialMessages.concat(sessionMessages.map((msg) => ({
            id: msg.id,
            message: msg.content,
            status: msg.role === ChatRoleEnum.User ? 'local' : 'success',
        }))));
    }, [sessionMessages, setMessages]);

    useEffect(() => {
        senderRef.current?.focus()
    }, [])

    return (
        <FloatButton.Group
            trigger="click"
            type="primary"
            icon={<MessageOutlined />}
        >
            <XProvider>
                <Flex className="container">
                    <div className='conversation-container'>
                        <Flex className='conversation-wrapper'>
                            <Conversations
                                defaultActiveKey="1"
                                items={[
                                    {
                                        key: '1',
                                        label: 'Conversation - 1',
                                    },
                                    {
                                        key: '2',
                                        label: 'Conversation - 2',
                                    },
                                ]}
                            />
                            <Divider type="vertical" />
                        </Flex>
                    </div>
                    <Flex className="chat" vertical>
                        <Bubble.List
                            roles={roles}
                            items={(messages.map(({ id, message, status }) => ({
                                key: id,
                                loading: status === 'loading',
                                role: status === 'local' ? ChatRoleEnum.User : ChatRoleEnum.Assistant,
                                content: message,
                            })))}
                        />
                        <div className="sender-container">
                            <div className="sender-wrapper">
                                <Sender
                                    ref={senderRef}
                                    placeholder='Ask anything'
                                    loading={agent.isRequesting()}
                                    value={content}
                                    onChange={setContent}
                                    onSubmit={(nextContent) => {
                                        onRequest(nextContent);
                                        setContent('');
                                    }}
                                />
                            </div>
                        </div>
                    </Flex>
                </Flex>
            </XProvider>
        </FloatButton.Group>
    );
};

export default App;