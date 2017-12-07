import createDebug from 'debug';
import Base from './base';

const debug = createDebug('rocket-chat-realtime:client');
const MESSAGE_SUBSCRIBE_TOPIC = 'stream-room-messages' // 'messages'
const MESSAGE_COLLECTION = 'stream-room-messages'
const methodExists = {}

export default class Client extends Base {
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
    const sub = super.subscribe(MESSAGE_SUBSCRIBE_TOPIC, roomId, false)
    this.ddp.on('changed', data => {
      if (data.collection !== MESSAGE_SUBSCRIBE_TOPIC) return;
      const {fields} = data;
      if (roomId !== fields.eventName) return;
      sub.emit('message', ...fields.args)
    })
    return sub;
  }


  // livechat methods

	livechatLoginByToken(token) {
		debug("Logging In")
		return super.call('livechat:loginByToken', token)
  }

  livechatGetInitialData(token) {
    return this.call('livechat:getInitialData', token)
  }

	sendMessageLivechat(content, roomId, token) {
    debug(`Sending Livechat Message To Room: ${roomId}`)

		const message = this.prepareMessage(content, roomId)
		return super.call('sendMessageLivechat', {...message, token})
  }
}
