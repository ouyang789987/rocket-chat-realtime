import createDebug from 'debug';
import Base from './base';

const debug = createDebug('rocket-chat-realtime:client');
const MESSAGE_SUBSCRIBE_TOPIC = 'stream-room-messages' // 'messages'
const MESSAGE_COLLECTION = 'stream-room-messages'
const methodExists = {}

export default class Client extends Base {
// export default class Client extends EventEmitter {
	constructor(options) {
    super(options);
  }

  ensureMethodExists(method) {
    const exists = methodExists[method];
    if (exists === true) return Promise.resolve();
    if (exists === false) return Promise.reject(new Error(`Method: ${method} does not exists`));

    debug("Checking to see if method: #{method} exists")
    return super.call(method, "")
      .then((res) => void (methodExists[method] = true))
      .catch((err) => {
        if(err.error === 404) {
          methodExists[method] = false
          debug("Method: #{method} does not exists")
          return Promise.reject(new Error(`Method: ${method} does not exists`))
        }
        methodExists[method] = true
      })
  }

  // methods

	login(username, password) {
		debug("Logging In")
		return super.loginWithPassword(username, password)
  }

  listEmojiCustom() {
    return super.call('listEmojiCustom');
  }

  loadHistory(roomId, ...rest) {
    // todo room name
    return super.call('loadHistory', roomId, ...rest)
  }

	getRoomId(room) {
		return super.call('getRoomIdByNameOrId', room)
  }

	getRoomName(room) {
		return super.call('getRoomNameById', room)
  }

	getDirectMessageRoomId(username) {
		return super.call('createDirectMessage', username)
  }

	joinRoom(roomId, joinCode) {
		return super.call('joinRoom', roomId, joinCode)
  }

	prepareMessage(content, rid) {
		debug(`Preparing message from ${ typeof content }`)
		if(typeof content === 'string')
			return {msg: content, rid}
		return {...content, rid}
  }

	sendMessage(message, room) {
    debug(`Sending Message To Room: ${room}`)
    // todo: cache
    // todo: is roomName ok?
		return this.getRoomId(room)
		  .then((roomId) =>
        this.sendMessageByRoomId(message, roomId)
      )
  }

	sendMessageByRoomId(content, roomId) {
		const message = this.prepareMessage(content, roomId)
		return super.call('sendMessage', message)
      .then(result => debug('[sendMessage] Success:', result))
		  .catch(error => debug('[sendMessage] Error:', error))
  }

	subscribeRoomMessages(roomId) {
		debug("Preparing Meteor Subscriptions..")
		return super.subscribe(MESSAGE_SUBSCRIBE_TOPIC, roomId, true)
  }
}
