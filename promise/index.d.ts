import net = require('net');
import tls = require('tls');
import https = require('https');
import http = require('http');
import events = require('events');
import Stream = require('stream');
import * as connect from 'connect';

export interface UtilsJSONParseOptions {
  reviver?: Function;
}

export interface UtilsJSONStringifyOptions {
  replacer?: Function;
}

export declare class Utils {

  static response(error: JSONRPCError | undefined | null, result: JSONRPCResultLike | undefined | null, id: JSONRPCIDLike | null | undefined, version?: number): JSONRPCVersionTwoRequest;
  static response(error: JSONRPCError | undefined | null, result: JSONRPCResultLike | undefined | null, id: JSONRPCIDLike | null | undefined, version:2): JSONRPCVersionTwoRequest;
  static response(error: JSONRPCError | undefined | null, result: JSONRPCResultLike | undefined | null, id: JSONRPCIDLike | null | undefined, version:1): JSONRPCVersionOneRequest;

  static generateId(): string;

  static merge(...objs: object[]): object;

  static parseStream(stream:Stream, options:UtilsJSONParseOptions, onRequest: (err?:Error, data?:any) => void): void;

  static parseBody(stream:Stream, options:UtilsJSONParseOptions, callback: (err?:Error, obj?:any) => void): void;

  static getHttpListener(self:http.Server, server:Server): Function;

  static isContentType(request:http.IncomingMessage, typ:string): boolean;

  static isMethod(request:http.IncomingMessage, method:string): boolean;

  static walk(obj:object, key:string, fn: (key:string, value:any) => any): object;

  static JSON: UtilsJSON;

  static Request: UtilsRequest;

  static Response: UtilsResponse;

}

type UtilsJSON = {
  parse(str:string, options:UtilsJSONParseOptions | null | undefined, callback: (err?:Error, obj?:object) => void):void;
  stringify(obj:object, options:UtilsJSONStringifyOptions | null | undefined, callback: (err?:Error, str?:string) => void):void;
}

type UtilsRequest = {
  isBatch(request:any): boolean;
  isNotification(request:any): boolean;
  isValidVersionTwoRequest(request:any): boolean;
  isValidVersionOneRequest(request:any): boolean;
  isValidRequest(request:any, version?:number): boolean;
}

type UtilsResponse = {
  isValidError(error:any, version?:number): boolean;
  isValidResponse(response:any, version?:number): boolean;
}

export type RequestParamsLike = Array<any> | object;

export interface JSONRPCError {
  code: number;
  message: string;
  data?: object;
}

export type JSONRPCErrorLike = Error | JSONRPCError;

export interface JSONRPCVersionOneRequest {
  method: string;
  params: Array<any>;
  id: JSONRPCIDLike;
}

export interface JSONRPCVersionTwoRequest {
  jsonrpc: number;
  method: string;
  params: RequestParamsLike;
  id?: JSONRPCIDLike | null;
}

export type JSONRPCIDLike = number | string;

export type JSONRPCRequest = JSONRPCVersionOneRequest | JSONRPCVersionTwoRequest;

export type JSONRPCRequestLike = JSONRPCRequest | string;

export type JSONRPCResultLike = any;

export interface JSONRPCCallbackTypePlain {
  (err?: JSONRPCErrorLike | null, result?: JSONRPCResultLike): void
}

export interface JSONRPCCallbackTypeSugared {
  (err?: Error | null, error?: JSONRPCErrorLike, result?: JSONRPCResultLike): void
}

type JSONRPCCallbackType = JSONRPCCallbackTypePlain | JSONRPCCallbackTypeSugared;

export interface JSONRPCCallbackTypeBatchPlain {
  (err: JSONRPCErrorLike, results?: Array<JSONRPCResultLike>): void
}

export interface JSONRPCCallbackTypeBatchSugared {
  (err: Error, errors?: Array<JSONRPCErrorLike>, results?: Array<JSONRPCResultLike>): void
}

type JSONRPCCallbackTypeBatch = JSONRPCCallbackTypeBatchPlain | JSONRPCCallbackTypeBatchSugared;

export interface MethodHandler {
  (this:Server, args:RequestParamsLike, callback:JSONRPCCallbackTypePlain): Promise<JSONRPCResultLike> | void;
}

export interface MethodHandlerContext {
  (this:Server, args:RequestParamsLike, context:object, callback:JSONRPCCallbackTypePlain): Promise<JSONRPCResultLike> | void;
}

export type MethodHandlerType = MethodHandlerContext | MethodHandler;

export type MethodOptionsParamsLike = Array<any> | Object | object;

export interface MethodOptions {
  handler?: MethodHandlerType;
  useContext?: boolean;
  params?: MethodOptionsParamsLike;
}

export declare class Method {
  constructor(options: MethodOptions);
  constructor(handler?: MethodHandlerType, options?: MethodOptions);

  getHandler(): MethodHandlerType;
  setHandler(handler: MethodHandlerType): void;
  execute(server: Server, requestParams: RequestParamsLike, callback: JSONRPCCallbackType): any | Promise<any>;
}

export type MethodLike = Function | Method | Client

export type ServerRouterFunction = (this: Server, method: string, params: RequestParamsLike) => MethodLike;

export interface ServerOptions {
  useContext?: boolean;
  params?: MethodOptionsParamsLike;
  version?: number;
  reviver?: JSONParseReviver;
  replacer?: JSONStringifyReplacer;
  encoding?: string;
  router?: ServerRouterFunction;
  methodConstructor?: Function;
}

export interface MethodMap { [methodName:string]: Method }

export declare class Server extends events.EventEmitter {
  constructor(methods?: {[methodName: string]: MethodLike}, options?: ServerOptions);

  static errors: {[errorName: string]: number};
  static errorMessages: {[errorMessage: string]: string};
  static interfaces: {[interfaces: string]: Function};

  public _methods: MethodMap;
  public options: ServerOptions;
  public errorMessages: {[errorMessage: string]: string};

  http(options?: HttpServerOptions): HttpServer;
  https(options?: HttpsServerOptions): HttpsServer;
  tcp(options?: TcpServerOptions): TcpServer;
  tls(options?: TlsServerOptions): TlsServer;
  middleware(options?: MiddlewareServerOptions): connect.HandleFunction;

  method(name: string, definition: MethodLike): void;
  methods(methods: {[methodName: string]: MethodLike}): void;
  hasMethod(name: string): boolean;
  removeMethod(name: string): void;
  getMethod(name: string): MethodLike;
  error(code?: number, message?: string, data?: object): JSONRPCError;
  call(request: JSONRPCRequestLike | Array<JSONRPCRequestLike>, originalCallback?: JSONRPCCallbackType): void;
  call(request: JSONRPCRequestLike | Array<JSONRPCRequestLike>, context: object, originalCallback?: JSONRPCCallbackType): void;
}

export interface MiddlewareServerOptions extends ServerOptions {
  end?: boolean;
}

export interface HttpServerOptions extends ServerOptions {
}

declare class HttpServer extends http.Server {
  constructor(server: Server, options?: HttpServerOptions);
}

export interface HttpsServerOptions extends ServerOptions, https.ServerOptions {
}

declare class HttpsServer extends https.Server {
  constructor(server: Server, options?: HttpsServerOptions);
}

export interface TcpServerOptions extends ServerOptions {
}

declare class TcpServer extends net.Server {
  constructor(server: Server, options?: TcpServerOptions);
}

export interface TlsServerOptions extends tls.TlsOptions {
}

declare class TlsServer extends tls.Server {
  constructor(server: Server, options?: TlsServerOptions);
}

type JSONParseReviver = (key: string, value: any) => any;
type JSONStringifyReplacer = (key: string, value: any) => any;

type IDGenerator = () => string;

export interface ClientOptions {
  version?: number;
  reviver?: JSONParseReviver;
  replacer?: JSONStringifyReplacer;
  generator?: IDGenerator;
}

export interface HttpClientOptions extends ClientOptions, http.RequestOptions {
}

declare class HttpClient extends Client {
  constructor(options?: HttpClientOptions);
}

export interface TlsClientOptions extends ClientOptions, tls.ConnectionOptions {
}

declare class TlsClient extends Client {
  constructor(options?: TlsClientOptions);
}

export interface TcpClientOptions extends ClientOptions, net.TcpSocketConnectOpts {
}

declare class TcpClient extends Client {
  constructor(options?: TcpClientOptions);
}

export interface HttpsClientOptions extends ClientOptions, https.RequestOptions {
}

declare class HttpsClient extends Client {
  constructor(options?: HttpsClientOptions);
}

type ClientRequestShouldCall = JSONRPCCallbackType | false;

export declare class Client extends events.EventEmitter {
  constructor(server: Server, options?: ClientOptions);
  constructor(options: ClientOptions);

  static http(options?: HttpClientOptions): HttpClient;
  static https(options?: HttpsClientOptions): HttpsClient;
  static tcp(options?: TcpClientOptions): TcpClient;
  static tls(options?: TlsClientOptions): TlsClient;

  request(method:string, params:RequestParamsLike, id:JSONRPCIDLike | undefined, shouldCall:false): JSONRPCRequest;
  request(method:string, params:RequestParamsLike, id?:JSONRPCIDLike): Promise<JSONRPCResultLike>;
  request(method: Array<JSONRPCRequestLike>): Promise<JSONRPCResultLike>;
}
