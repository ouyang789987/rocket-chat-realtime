// @ts-nocheck
import Client from 'rocket-chat-realtime';
import {Client as WebSocket} from 'faye-websocket';
import 'dotenv/config'

const baseUrl = process.env.BASE_URL
const token = process.env.TOKEN
const loginToken = process.env.LOGIN_TOKEN
const a = "abcdefghijklmnopqrstuvwxyz0123456789_";



function getEndpoint(url) {
  const [protocol, base] = url.split('://');
  if (!base || protocol === 'http') return `ws://${base}`;
  if (protocol === 'https') return `wss://${base}`;
  return url;
}

// use sockjs
const endpoint = getEndpoint(baseUrl) + 'websocket';

console.log('connect to endpoint:', endpoint)

const client = new Client({
  endpoint,
  SocketConstructor: WebSocket
});

client.subscribe("tasksPublication");

client.on('connected', data => {
  console.log('connected', data);
});

client.on('error', err => {
  console.error(err);
});

if (loginToken) {
  client.call('login', {resume: loginToken})
    .then(() => console.log('login use token success'))
    .catch((err) => console.error('login use token failed', err))
} else {
  client.livechatLoginByToken(token)
    .then(() => console.log('login success'))
    .catch((err) => console.error('login failed', err))
}

client.call('livechat:getInitialData', token)
  .then((result) => {
    if (result.room) {
      const roomId = result.room._id;
      client.subscribeRoomMessages(roomId).on('ready', console.log)
        .on('message', message => console.log('message:', message))


      client.sendMessageLivechat('hello', roomId, loginToken)
        .then(result => console.log('send result', result))
      return client.loadHistory(roomId)
    }
    console.log('getInitialData', result)
  })
  .then(history => {
    console.log(history.length)
  })
  .catch((err) => console.error('login fail', err))
