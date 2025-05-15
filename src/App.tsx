import { UserOutlined } from '@ant-design/icons';
import { Bubble, Conversations, Sender, useXAgent, useXChat, XProvider } from '@ant-design/x';
import { Divider, Flex, type GetProp, type GetRef } from 'antd';
import { useEffect, useRef, useState } from 'react';
import "./App.css"

const sleep = () => new Promise((resolve) => setTimeout(resolve, 100));

const roles: GetProp<typeof Bubble.List, 'roles'> = {
    ai: {
        placement: 'start',
        avatar: { icon: <UserOutlined />, style: { background: '#fde3cf' } },
        typing: { step: 5, interval: 20 },
        style: {
            maxWidth: 600,
        },
    },
    local: {
        placement: 'end',
        avatar: { icon: <UserOutlined />, style: { background: '#87d068' } },
    },
};

let mockSuccess = false;

const App = () => {
    const senderRef = useRef<GetRef<typeof Sender>>(null);

    const [content, setContent] = useState('');

    const [agent] = useXAgent<string, { message: string }, string>({
        request: async ({ message }, { onSuccess, onError }) => {
            await sleep();
            mockSuccess = !mockSuccess;
            if (mockSuccess) {
                onSuccess([`Mock success return. You said: ${message}`]);
            }

            onError(new Error('Mock request failed'));
        },
    });

    const { onRequest, messages } = useXChat({
        agent,
        requestPlaceholder: 'Waiting...',
        requestFallback: 'Mock failed return. Please try again later.',
    });

    useEffect(() => {
        if (senderRef) {
            senderRef.current?.focus()
        }
    }, [])

    return (
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
                        items={messages.map(({ id, message, status }) => ({
                            key: id,
                            loading: status === 'loading',
                            role: status === 'local' ? 'local' : 'ai',
                            content: message,
                        }))}
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
    );
};

export default App;