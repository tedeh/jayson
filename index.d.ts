import http = require('http');
import events = require('events');

export as namespace jayson;

export const client: Client;
export const server: Server;
export const method: Method;
export const utils: Utils;

interface Utils {
}

declare type RequestParamsLike = Array<any> | object;

interface JSONRPCError {
  code: number;
  message: string;
  data?: object;
}

interface JSONRPCVersionOneRequest {
  method: string;
  params: Array<any>;
  id: JSONRPCIDLike;
}

interface JSONRPCVersionTwoRequest {
  jsonrpc: number;
  method: string;
  params: RequestParamsLike;
  id?: JSONRPCIDLike | null;
}

declare type JSONRPCIDLike = number | string;

declare type JSONRPCRequest = JSONRPCVersionOneRequest | JSONRPCVersionTwoRequest;

declare type JSONRPCRequestLike = JSONRPCRequest | string;

declare type JSONRPCResultLike = any;

interface JSONRPCCallbackType {
  (err?: JSONRPCError, result?: JSONRPCResultLike): void
}

interface MethodHandlerType {
  (args: RequestParamsLike, callback: JSONRPCCallbackType): void;
  (...args: any[]): void; // callback still expected to be last
}

declare type MethodOptionsParamsLike = Array<any> | Object | object;

interface MethodOptions {
  handler?: MethodHandlerType;
  collect?: boolean;
  params?: MethodOptionsParamsLike;
}

declare class Method {
  constructor(handler?: MethodHandlerType, options?: MethodOptions);
  constructor(options: MethodOptions);

  getHandler(): MethodHandlerType;
  setHandler(handler: MethodHandlerType): void;
  execute(server: Server, requestParams: RequestParamsLike, callback: JSONRPCCallbackType);
}

declare type MethodLike = Function | Method | Client

declare type ServerRouterFunction = (method: string, params: RequestParamsLike) => MethodLike;

interface ServerOptions {
  collect?: boolean;
  params?: MethodOptionsParamsLike;
  version?: number;
  reviver?: JSONParseReviver;
  replacer?: JSONStringifyReplacer;
  encoding?: string;
  router?: ServerRouterFunction;
  methodConstructor?: Function;
}

declare class Server {
  constructor(methods?: {[methodName: string]: MethodLike}, options?: object);

  static errors: {[errorName: string]: number};
  static errorMessages: {[errorMessage: string]: string};
  static interfaces: {[interfaces: string]: Function};

  http(options?: HttpServerOptions): HttpServer;

  method(name: string, definition: MethodLike): void;
  methods(methods: {[methodName: string]: MethodLike}): void;
  hasMethod(name: string): boolean;
  removeMethod(name: string): void;
  getMethod(name: string): MethodLike;
  error(code?: number, message?: string, data?: object): JSONRPCError;
  call(request: JSONRPCRequestLike | Array<JSONRPCRequestLike>, originalCallback?: JSONRPCCallbackType);
}

interface HttpServerOptions {
}

declare class HttpServer extends http.Server {
  constructor(server: Server, options?: HttpServerOptions);
}

declare type JSONParseReviver = (key: string, value: any) => any;
declare type JSONStringifyReplacer = (key: string, value: any) => any;

declare type IDGenerator = () => string;

interface ClientOptions {
  version?: number;
  reviver?: JSONParseReviver;
  replacer?: JSONStringifyReplacer;
  generator: IDGenerator;
}

interface HttpClientOptions extends ClientOptions {
  encoding?: string;
}

declare class HttpClient extends Client {
  constructor(options?: HttpClientOptions);
}

declare class Client extends events.EventEmitter {
  constructor(server: Server, options: ClientOptions);
  constructor(options: ClientOptions);

  static http(options?: HttpClientOptions): HttpClient;

  request(method: string, params: RequestParamsLike, id?: string, callback?: JSONRPCCallbackType);
  request(method: Array<JSONRPCRequestLike>, callback?: JSONRPCCallbackType);
}
