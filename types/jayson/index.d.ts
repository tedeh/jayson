// Type definitions for jayson 2.0.6
// Project: https://github.com/tedeh/jayson
// Definitions by: Tedde Lundgren <https://github.com/tedeh>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

export namespace jayson {
  const client: Client;
  const Client: Client;

  const server: Server;
  const Server: Server;

  const method: Method;
  const Method: Method;

  const Utils: Utils;
  const utils: Utils;
}

type RequestParamsLike = Array<any> | object;

type MethodLike = Method | Client

type MethodOptionsParamsLike = Array | Array<any> | Object | object;

type JSONRPCIDLike = number | string;

type JSONRPCRequest = JSONRPCVersionOneRequest | JSONRPCVersionTwoRequest;

type JSONRPCRequestLike = JSONRPCRequest | string;

type JSONRPCResultLike = any;

interface JSONRPCError {
  code: number;
  message: string;
  data?: object;
}

interface JSONRPCCallbackType {
  (err?: JSONRPCError, result? JSONRPCResultLike): void
}

interface MethodHandlerType {
  (args: RequestParamsLike, callback: JSONRPCCallbackType): void;
  (...args: any[], callback: JSONRPCCallbackType): void;
}

interface MethodOptions {
  handler?: MethodHandlerType;
  collect?: boolean;
  params?: MethodOptionsParamsLike;
};

type IDGenerator = () => string;

interface ClientOptions {
  version?: number;
  reviver?: JSONParseReviver;
  replacer?: JSONStringifyReplacer;
  generator: IDGenerator;
}

type JSONParseReviver = (key: string, value: any) => any;

type JSONStringifyReplacer = (key: string, value: any) => any;

type ServerRouterFunction = (method: string, params: RequestParamsLike) => MethodLike;

interface JSONRPCError {
  code: number;
  message: string;
  data?: object;
}

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

declare class Client {
  constructor(server: Server, options: ClientOptions);
  constructor(options: ClientOptions);
  request(method: string, params: RequestParamsLike, id?: string, callback?: JSONRPCCallbackType): void;
  request(method: Array<JSONRPCRequestLike>, callback?: JSONRPCCallbackType) void;
}

declare class Method {
  constructor(handler?: MethodHandlerType, options?: MethodOptions);
  constructor(options: MethodOptions);

  getHandler(): MethodHandlerType;
  setHandler(handler: MethodHandlerType): void;
  execute(server: Server, requestParams: RequestParamsLike, callback: JSONRPCCallbackType);
}

declare class Server {
  constructor([methods: string]?): MethodLike, options?: ServerOptions);

  call(request: JSONRPCRequestLike | Array<JSONRPCRequestLike>, originalCallback?: JSONRPCCallbackType): void;
  error(code?: number, message?: string, data?: object): JSONRPCError;
  getMethod(name: string): MethodLike;
  hasMethod(name: string): boolean;
  method(name: string, definition: MethodLike): void;
  methods([methods: string]: MethodLike): void;
  removeMethod(name: string): void;
  static errorMessages: {
    "-32600": string;
    "-32601": string;
    "-32602": string;
    "-32603": string;
    "-32700": string;
  };
  static errors: {
    INTERNAL_ERROR: number;
    INVALID_PARAMS: number;
    INVALID_REQUEST: number;
    METHOD_NOT_FOUND: number;
    PARSE_ERROR: number;
  };
}

declare namespace Utils {
    function generateId(): string;
    function getHttpListener(self: any, server: any): Function;
    function getParameterNames(func: Function): string[];
    function isContentType(request: any, type: string): boolean;
    function isMethod(request: any, method: string): boolean;
    function merge(...args: object[]): object;
    function parseBody(stream: any, options: any, callback: any): any;
    function parseStream(stream: any, options: object, onRequest: Function): void;
    function request(method: any, params: any, id: any, options: any): any;
    function response(error?: any, result?: any, id?: any, version?: any): object;
    function walk(holder: object, key: string, fn: Function): object;
    namespace JSON {
        function parse(str: any, options: any, callback: any): any;
        function stringify(obj: any, options: any, callback: any): any;
    }
    namespace Request {
        function isBatch(request: object): boolean;
        function isNotification(request: object): boolean;
        function isValidRequest(request: object, version: any): boolean;
        function isValidVersionOneRequest(request: object): boolean;
        function isValidVersionTwoRequest(request: object): boolean;
    }
    namespace Response {
        function isValidError(error: any, version: any): boolean;
    }
}
