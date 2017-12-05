import sinon from 'sinon';
import {WebSocket} from 'mock-socket';
import Client from '../src/client'
import Base from '../src/base'

describe('todo', function () {
  it('todo', function () {
    new Client({
      endpoint: 'ws://localhost',
      SocketConstructor: WebSocket,
      autoConnect: false,
    }).should.instanceof(Base);
  });
});

