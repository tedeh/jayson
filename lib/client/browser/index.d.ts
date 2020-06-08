import * as jayson from '../../..';

type ClientBrowserCallServerFunction = (request:jayson.JSONRPCRequestLike, callback:jayson.JSONRPCCallbackType) => void;

declare class ClientBrowser {
  constructor(callServer:ClientBrowserCallServerFunction, options:jayson.ClientOptions);
  request(method: string, params: jayson.RequestParamsLike, id?: string | null, callback?: jayson.JSONRPCCallbackType): jayson.JSONRPCRequest;
  request(method: string, params: jayson.RequestParamsLike, callback?: jayson.JSONRPCCallbackType): jayson.JSONRPCRequest;
  request(method: Array<jayson.JSONRPCRequestLike>, callback: jayson.JSONRPCCallbackTypeBatch): Array<jayson.JSONRPCRequest>;
}

export = ClientBrowser;
