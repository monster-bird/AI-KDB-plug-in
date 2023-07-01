const LOCAL_RELOAD_SOCKET_PORT = 8081;
const LOCAL_RELOAD_SOCKET_URL = `ws://localhost:${LOCAL_RELOAD_SOCKET_PORT}`;
const UPDATE_PENDING_MESSAGE = 'wait_update';
const UPDATE_REQUEST_MESSAGE = 'do_update';
const UPDATE_COMPLETE_MESSAGE = 'done_update';

class MessageInterpreter {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    constructor() { }
    static send(message) {
        return JSON.stringify(message);
    }
    static receive(serializedMessage) {
        return JSON.parse(serializedMessage);
    }
}

let needToUpdate = false;
function initReloadClient({ watchPath, onUpdate }) {
    const socket = new WebSocket(LOCAL_RELOAD_SOCKET_URL);
    function sendUpdateCompleteMessage() {
        socket.send(MessageInterpreter.send({ type: UPDATE_COMPLETE_MESSAGE }));
    }
    socket.addEventListener('message', event => {
        const message = MessageInterpreter.receive(String(event.data));
        switch (message.type) {
            case UPDATE_REQUEST_MESSAGE: {
                if (needToUpdate) {
                    sendUpdateCompleteMessage();
                    needToUpdate = false;
                    onUpdate();
                }
                return;
            }
            case UPDATE_PENDING_MESSAGE: {
                if (!needToUpdate) {
                    needToUpdate = message.path.includes(watchPath);
                }
                return;
            }
        }
    });
    socket.addEventListener('close', () => {
        console.log('Reload server disconnected.');
    });
    return socket;
}

function addHmrIntoScript(watchPath) {
    initReloadClient({
        watchPath,
        onUpdate: () => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            chrome.runtime.reload();
        }
    });
}

export { addHmrIntoScript as default };
