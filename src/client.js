import EventEmitter from 'wolfy87-eventemitter';
import {createClass} from 'asteroid';
import createDebug from 'debug';

const debug = createDebug('rocket-chat-realtime:client');
const MESSAGE_SUBSCRIBE_TOPIC = 'stream-room-messages' // 'messages'
const MESSAGE_COLLECTION = 'stream-room-messages'
const methodExists = {}

function pipeEvent(from, to, ...events) {
  events.forEach(e => from.on(e, (...args) => to.emit(e, ...args)));
}

export default class RocketChatDriver extends EventEmitter {
	constructor(options) {
    super();
    const Asteroid = createClass();
		this.asteroid = new Asteroid(options)

    pipeEvent(this.asteroid, this, 'connected', 'reconnected')
  }

  connect() {
    this.asteroid.connect();
  }

	login(username, password) {
		debug("Logging In")
		return this.asteroid.loginWithPassword(username, password)
  }

	callMethod(name, ...args) {
		debug(`Calling: ${name}, ${args.join(', ')}`)
		return this.asteroid.apply(name, args)
  }

  ensureMethodExists(method) {
    const exits = methodExists[method];
    if (exists === true) return Promise.resolve();
    if (exists === false) return Promise.reject(new Error(`Method: ${method} does not exist`));

    debug("Checking to see if method: #{method} exists")
    return this.asteroid.call(method, "")
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
		this.callMethod('getRoomIdByNameOrId', room)
  }

	getRoomName(room) {
		this.callMethod('getRoomNameById', room)
  }

	getDirectMessageRoomId(username) {
		this.callMethod('createDirectMessage', username)
  }

	joinRoom(roomId, joinCode) {
		return this.callMethod('joinRoom', roomId, joinCode)
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
		return this.asteroid.call('sendMessage', message)
      .then(result => debug('[sendMessage] Success:', result))
		  .catch(error => debug('[sendMessage] Error:', error))
  }

	subscribeRoomMessages(roomId) {
		debug("Preparing Meteor Subscriptions..")
		return this.asteroid.subscribe(MESSAGE_SUBSCRIBE_TOPIC, roomId, true)
  }
}
