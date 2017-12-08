import _ from 'lodash/fp';
import createDebug from 'debug';
import Client from './client';

const debug = createDebug('rocket-chat-realtime:livechat');

export default class LivechatClient extends Client {
	constructor({visitorToken, guestInfo, ...options} = {}) {
    super(options);
    this.visitorToken = visitorToken || _.get('token', guestInfo) || genToken();
    this.guestInfo = _.omit('token', guestInfo)
    this.roomInit = false;
    this.getInitialData();
  }

  // methods

	loginByToken() {
    return this.call('livechat:loginByToken', this.visitorToken)
      .then((result) => {
        if (_.isEmpty(result)) return;
        const {token} = result;
        this.loginWithToken(token)
      })
  }

	registerGuest({token, ...guestInfo} = {}) {
    token = token || this.visitorToken;
    if (!_.isEmpty(guestInfo)) this.guestInfo = guestInfo;
    return this.call('livechat:registerGuest', {...this.guestInfo, token})
      .then(({token}) => this.loginWithToken(token))
  }

  getInitialData() {
    debug('get init data start');
    return this.call('livechat:getInitialData', this.visitorToken)
      .then((result) => {
        debug('get init data end', result);
        // ["enabled", "title", "color", "registrationForm", "room", "triggers", "departments", "allowSwitchingDepartments", "online", "offlineColor", "offlineMessage", "offlineSuccessMessage", "offlineUnavailableMessage", "displayOfflineForm", "videoCall", "offlineTitle", "language", "transcript", "transcriptMessage", "agentData"]
        _.assign(this, _.pick(['room', 'title'], result));
        this.roomInfo = result;
        this.roomInit = true;
        this.emit('roomInit');
      });
  }

  ensureInit() {
    if (!this.roomInit) throw new Error('room not init');
  }

  get roomId() {
    this.ensureInit();
    return this.room._id;
  }

  loadHistory() {
    return super.loadHistory(this.roomId)
  }

	sendMessage(content) {
    const roomId = this.roomId;
    debug(`Sending Livechat Message To Room: ${roomId}`)

		const message = this.prepareMessage(content, roomId)
		return this.call('sendMessageLivechat', {...message, token: this.visitorToken})
  }

  subscribeMessages(handleMessage) {
    const sub = super.subscribeRoomMessages(this.roomId)
    if (handleMessage) sub.on('message', handleMessage);
    return sub;
  }
}

function genToken() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
