declare namespace jayson {
  const client: Client;
  const Client: Client;

  const server: Server;
  const Server: Server;

  const method: Method;
  const Method: Method;

  const Utils: Utils;
  const utils: Utils;
}

interface Utils {
}

type RequestParamsLike = Array<any> | object;

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

type JSONRPCIDLike = number | string;

type JSONRPCRequest = JSONRPCVersionOneRequest | JSONRPCVersionTwoRequest;

type JSONRPCRequestLike = JSONRPCRequest | string;

type JSONRPCResultLike = any;

interface JSONRPCCallbackType {
  (err?: JSONRPCError, result? JSONRPCResultLike): void
}

interface MethodHandlerType {
  (args: RequestParamsLike, callback: JSONRPCCallbackType): void;
  (...args: any[], callback: JSONRPCCallbackType): void;
}

type MethodOptionsParamsLike = Array | Array<any> | Object | object;

interface MethodOptions {
  handler?: MethodHandlerType;
  collect?: boolean;
  params?: MethodOptionsParamsLike;
};

declare class Method {
  constructor(handler: MethodHandlerType, options?: MethodOptions);
  constructor(options: MethodOptions);

  getHandler(): MethodHandlerType;
  setHandler(handler: MethodHandlerType): void;
  execute(server: Server, requestParams: RequestParamsLike, callback: JSONRPCCallbackType);
}

type MethodLike = Method | Client

type ServerRouterFunction = (method: string, params: RequestParamsLike) => MethodLike;

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
  constructor([methods: string]?: MethodLike, options?: object);

  [errorMessages: string]: string;
  [interfaces: string]: Function;

  method(name: string, definition: MethodLike): void;
  methods([methods: string]: MethodLike): void;
  hasMethod(name: string): boolean;
  removeMethod(name: string): void;
  getMethod(name: string): MethodLike;
  error(code?: number, message?: string, data?: object): JSONRPCError;
  call(request: JSONRPCRequestLike | Array<JSONRPCRequestLike>, originalCallback?: JSONRPCCallbackType);
}

type JSONParseReviver = (key: string, value: any) => any;
type JSONStringifyReplacer = (key: string, value: any) => any;

type IDGenerator = () => string;

interface ClientOptions {
  version?: number;
  reviver?: JSONParseReviver;
  replacer?: JSONStringifyReplacer;
  generator: IDGenerator;
}

declare class Client {
  constructor(server: Server, options: ClientOptions);
  constructor(options: ClientOptions);

  request(method: string, params: RequestParamsLike, id?: string, callback?: JSONRPCCallbackType);
  request(method: Array<JSONRPCRequestLike>, callback?: JSONRPCCallbackType);
}
