import React from 'react';
import classnames from 'classnames';

function getSentTime(date) {
    return new Date(date).toLocaleTimeString('en-US');
}

const MessageItem = ({ messages, index }) => {
    const msg = messages[index];

    // If user changed
    const isNewUser =
        index === 0 || messages[index].user_id !== messages[index - 1].user_id;

    // If current user's message
    const isCurrentUser = !msg.user_id;

    // If passed more than 5 minutes
    const isPassedTime =
        !isNewUser &&
        Math.abs(
            new Date(messages[index].datetime).getTime() -
                new Date(messages[index - 1].datetime).getTime()
        ) >
            1000 * 60 * 5;

    return (
        <div>
            {(isNewUser || isPassedTime) && (
                <div className="chat-sender d-flex justify-content-between align-items-center">
                    <div className="chat-sender-name">
                        {!isCurrentUser ? msg.user_id : ''}
                    </div>
                    <div className="chat-sender-time">
                        {getSentTime(msg.datetime)}
                    </div>
                </div>
            )}
            <div
                className={classnames(
                    'chat-message',
                    isCurrentUser ? 'my-message' : 'client-message',
                    (isNewUser || isPassedTime) && 'new-message'
                )}
            >
                {msg.msg}
            </div>
        </div>
    );
};

export default MessageItem;
