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

	login(username, password) {
		debug("Logging In")
		return super.loginWithPassword(username, password)
  }

  ensureMethodExists(method) {
    const exits = methodExists[method];
    if (exists === true) return Promise.resolve();
    if (exists === false) return Promise.reject(new Error(`Method: ${method} does not exist`));

    debug("Checking to see if method: #{method} exists")
    return super.call(method, "")
      .then((res) => void (methodExists[method] = true))
      .catch((err) => {
        if(err.error === 404) {
          methodExists[method] = false
          debug("Method: #{method} does not exist")
          return Promise.reject(new Error(`Method: ${method} does not exist`))
        }
        methodExists[method] = true
      })
  }

	getRoomId(room) {
		super.call('getRoomIdByNameOrId', room)
  }

	getRoomName(room) {
		super.call('getRoomNameById', room)
  }

	getDirectMessageRoomId(username) {
		super.call('createDirectMessage', username)
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
		message = this.prepareMessage(content, roomId)
		return super.call('sendMessage', message)
      .then(result => debug('[sendMessage] Success:', result))
		  .catch(error => debug('[sendMessage] Error:', error))
  }

	subscribeRoomMessages(roomId) {
		debug("Preparing Meteor Subscriptions..")
		return super.subscribe(MESSAGE_SUBSCRIBE_TOPIC, roomId, true)
  }
}
