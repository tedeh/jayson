import net = require('net');
import tls = require('tls');
import https = require('https');
import http = require('http');
import events = require('events');

export as namespace jayson;

interface Utils {
}

declare type RequestParamsLike = Array<any> | object;

interface JSONRPCError {
  code: number;
  message: string;
  data?: object;
}

declare type JSONRPCErrorLike = Error | JSONRPCError;

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

interface JSONRPCCallbackTypePlain {
  (err: JSONRPCErrorLike, result?: JSONRPCResultLike): void
}

interface JSONRPCCallbackTypeSugared {
  (err: Error, error?: JSONRPCErrorLike, result?: JSONRPCResultLike): void
}

type JSONRPCCallbackType = JSONRPCCallbackTypePlain | JSONRPCCallbackTypeSugared;

interface JSONRPCCallbackTypeBatchPlain {
  (err: JSONRPCErrorLike, results?: Array<JSONRPCResultLike>): void
}

interface JSONRPCCallbackTypeBatchSugared {
  (err: Error, errors?: Array<JSONRPCErrorLike>, results?: Array<JSONRPCResultLike>): void
}

type JSONRPCCallbackTypeBatch = JSONRPCCallbackTypeBatchPlain | JSONRPCCallbackTypeBatchSugared;

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
  execute(server: Server, requestParams: RequestParamsLike, callback: JSONRPCCallbackType): any | Promise<any>;
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
  https(options?: HttpsServerOptions): HttpsServer;
  tcp(options?: TcpServerOptions): TcpServer;
  tls(options?: TlsServerOptions): TlsServer;
  middleware(options?: MiddlewareServerOptions): Function;

  method(name: string, definition: MethodLike): void;
  methods(methods: {[methodName: string]: MethodLike}): void;
  hasMethod(name: string): boolean;
  removeMethod(name: string): void;
  getMethod(name: string): MethodLike;
  error(code?: number, message?: string, data?: object): JSONRPCError;
  call(request: JSONRPCRequestLike | Array<JSONRPCRequestLike>, originalCallback?: JSONRPCCallbackType): void;
}

interface MiddlewareServerOptions extends ServerOptions {
}

interface HttpServerOptions extends ServerOptions {
}

declare class HttpServer extends http.Server {
  constructor(server: Server, options?: HttpServerOptions);
}

interface HttpsServerOptions extends ServerOptions, https.ServerOptions {
}

declare class HttpsServer extends https.Server {
  constructor(server: Server, options?: HttpsServerOptions);
}

interface TcpServerOptions extends ServerOptions {
}

declare class TcpServer extends net.Server {
  constructor(server: Server, options?: TcpServerOptions);
}

interface TlsServerOptions extends tls.TlsOptions {
}

declare class TlsServer extends tls.Server {
  constructor(server: Server, options?: TlsServerOptions);
}

declare type JSONParseReviver = (key: string, value: any) => any;
declare type JSONStringifyReplacer = (key: string, value: any) => any;

declare type IDGenerator = () => string;

interface ClientOptions {
  version?: number;
  reviver?: JSONParseReviver;
  replacer?: JSONStringifyReplacer;
  generator?: IDGenerator;
}

interface HttpClientOptions extends ClientOptions, http.RequestOptions {
}

declare class HttpClient extends Client {
  constructor(options?: HttpClientOptions);
}

interface TlsClientOptions extends ClientOptions, tls.ConnectionOptions {
}

declare class TlsClient extends Client {
  constructor(options?: TlsClientOptions);
}

interface TcpClientOptions extends ClientOptions, net.TcpSocketConnectOpts {
}

declare class TcpClient extends Client {
  constructor(options?: TcpClientOptions);
}

interface HttpsClientOptions extends ClientOptions, https.RequestOptions {
}

declare class HttpsClient extends Client {
  constructor(options?: HttpsClientOptions);
}

declare class Client extends events.EventEmitter {
  constructor(server: Server, options?: ClientOptions);
  constructor(options: ClientOptions);

  static http(options?: HttpClientOptions): HttpClient;
  static https(options?: HttpsClientOptions): HttpsClient;
  static tcp(options?: TcpClientOptions): TcpClient;
  static tls(options?: TlsClientOptions): TlsClient;

  request(method: string, params: RequestParamsLike, id?: string, callback?: JSONRPCCallbackType): JSONRPCRequest;
  request(method: string, params: RequestParamsLike, callback?: JSONRPCCallbackType): JSONRPCRequest;
  request(method: Array<JSONRPCRequestLike>, callback?: JSONRPCCallbackTypeBatch): Array<JSONRPCRequest>;
}
