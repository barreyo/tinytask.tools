export interface StatusCode {
  code: number;
  phrase: string;
  description: string;
  category: '1xx' | '2xx' | '3xx' | '4xx' | '5xx';
}

export const statusCodes: StatusCode[] = [
  // 1xx Informational
  {
    code: 100,
    phrase: 'Continue',
    description:
      'The server has received the request headers and the client should proceed to send the request body.',
    category: '1xx',
  },
  {
    code: 101,
    phrase: 'Switching Protocols',
    description:
      'The server agrees to switch to the protocol specified in the Upgrade request header (e.g. WebSocket).',
    category: '1xx',
  },
  {
    code: 102,
    phrase: 'Processing',
    description:
      'The server has accepted the request and is processing it, but has not yet completed — used to prevent timeouts on long operations.',
    category: '1xx',
  },
  {
    code: 103,
    phrase: 'Early Hints',
    description:
      'Allows the server to send response headers early so the client can start preloading resources before the final response is ready.',
    category: '1xx',
  },

  // 2xx Success
  {
    code: 200,
    phrase: 'OK',
    description:
      'The request succeeded; the response body contains the requested resource or the result of the action.',
    category: '2xx',
  },
  {
    code: 201,
    phrase: 'Created',
    description:
      'The request succeeded and a new resource was created; the Location header typically points to the new resource URL.',
    category: '2xx',
  },
  {
    code: 202,
    phrase: 'Accepted',
    description:
      'The request has been accepted for processing, but processing has not completed — commonly used for async or queued operations.',
    category: '2xx',
  },
  {
    code: 203,
    phrase: 'Non-Authoritative Information',
    description:
      "The response is from a proxy or cache that modified the origin server's 200 response.",
    category: '2xx',
  },
  {
    code: 204,
    phrase: 'No Content',
    description:
      'The request succeeded but there is no response body to return — common for DELETE or PUT operations.',
    category: '2xx',
  },
  {
    code: 205,
    phrase: 'Reset Content',
    description:
      'Like 204, but instructs the client to reset the document view (e.g. clear a form after submission).',
    category: '2xx',
  },
  {
    code: 206,
    phrase: 'Partial Content',
    description:
      'The server is delivering only part of the resource, as requested by a Range header — used for resumable downloads and video streaming.',
    category: '2xx',
  },
  {
    code: 207,
    phrase: 'Multi-Status',
    description:
      'The response body contains multiple separate response codes for a batch operation, typically in WebDAV.',
    category: '2xx',
  },
  {
    code: 208,
    phrase: 'Already Reported',
    description:
      'The members of a DAV binding have already been enumerated in a previous reply and are not being included again.',
    category: '2xx',
  },
  {
    code: 226,
    phrase: 'IM Used',
    description:
      'The server fulfilled a GET request and the response is a representation of the result of one or more instance manipulations applied to the current instance.',
    category: '2xx',
  },

  // 3xx Redirection
  {
    code: 300,
    phrase: 'Multiple Choices',
    description:
      'The request has more than one possible response; the client or user should choose one.',
    category: '3xx',
  },
  {
    code: 301,
    phrase: 'Moved Permanently',
    description:
      'The resource has been permanently moved to the URL in the Location header; clients should update their bookmarks.',
    category: '3xx',
  },
  {
    code: 302,
    phrase: 'Found',
    description:
      'The resource is temporarily at a different URI; the client should continue to use the original URL for future requests.',
    category: '3xx',
  },
  {
    code: 303,
    phrase: 'See Other',
    description:
      'The response to the request can be found at a different URI using GET — commonly used after a POST to redirect to a success page.',
    category: '3xx',
  },
  {
    code: 304,
    phrase: 'Not Modified',
    description:
      'The cached version of the resource is still valid; the client should use its cached copy instead of re-downloading.',
    category: '3xx',
  },
  {
    code: 307,
    phrase: 'Temporary Redirect',
    description:
      'Like 302, but the client must use the same HTTP method for the redirected request (method is not changed to GET).',
    category: '3xx',
  },
  {
    code: 308,
    phrase: 'Permanent Redirect',
    description:
      'Like 301, but the client must use the same HTTP method for all future requests to the new URL (method is preserved).',
    category: '3xx',
  },

  // 4xx Client Errors
  {
    code: 400,
    phrase: 'Bad Request',
    description:
      'The server cannot process the request because the client sent malformed syntax, invalid parameters, or a deceptive request.',
    category: '4xx',
  },
  {
    code: 401,
    phrase: 'Unauthorized',
    description:
      'Authentication is required and has not been provided or failed — despite the name, this means "unauthenticated".',
    category: '4xx',
  },
  {
    code: 402,
    phrase: 'Payment Required',
    description:
      'Reserved for future use; informally used by some APIs to indicate a subscription limit or paywall has been reached.',
    category: '4xx',
  },
  {
    code: 403,
    phrase: 'Forbidden',
    description:
      'The server understands the request but refuses to authorize it — the client is authenticated but lacks the required permissions.',
    category: '4xx',
  },
  {
    code: 404,
    phrase: 'Not Found',
    description:
      'The server cannot find the requested resource; the URL may be wrong or the resource may have been deleted.',
    category: '4xx',
  },
  {
    code: 405,
    phrase: 'Method Not Allowed',
    description:
      'The HTTP method used (e.g. DELETE) is not allowed for the target resource; the Allow header lists permitted methods.',
    category: '4xx',
  },
  {
    code: 406,
    phrase: 'Not Acceptable',
    description:
      'The server cannot produce a response matching the Accept headers sent by the client (content negotiation failed).',
    category: '4xx',
  },
  {
    code: 407,
    phrase: 'Proxy Authentication Required',
    description:
      'Like 401, but authentication must be performed with the proxy server before the request can proceed.',
    category: '4xx',
  },
  {
    code: 408,
    phrase: 'Request Timeout',
    description:
      'The server timed out waiting for the request; the client may resend the request without modifications.',
    category: '4xx',
  },
  {
    code: 409,
    phrase: 'Conflict',
    description:
      'The request conflicts with the current state of the resource, such as a version conflict or duplicate creation attempt.',
    category: '4xx',
  },
  {
    code: 410,
    phrase: 'Gone',
    description:
      'The resource previously existed but has been permanently deleted with no forwarding address — more definitive than 404.',
    category: '4xx',
  },
  {
    code: 411,
    phrase: 'Length Required',
    description:
      'The server requires a Content-Length header in the request, which the client did not provide.',
    category: '4xx',
  },
  {
    code: 412,
    phrase: 'Precondition Failed',
    description:
      'A conditional request header (e.g. If-Match, If-Unmodified-Since) evaluated to false, so the request was not applied.',
    category: '4xx',
  },
  {
    code: 413,
    phrase: 'Content Too Large',
    description: "The request body exceeds the server's configured maximum size limit.",
    category: '4xx',
  },
  {
    code: 414,
    phrase: 'URI Too Long',
    description: 'The URI provided by the client is longer than the server is willing to process.',
    category: '4xx',
  },
  {
    code: 415,
    phrase: 'Unsupported Media Type',
    description:
      'The Content-Type of the request body is not in a format supported by the server for this endpoint.',
    category: '4xx',
  },
  {
    code: 416,
    phrase: 'Range Not Satisfiable',
    description:
      'The Range header in the request asks for a portion of the file that does not exist or is out of bounds.',
    category: '4xx',
  },
  {
    code: 417,
    phrase: 'Expectation Failed',
    description: 'The Expect request header could not be satisfied by the server.',
    category: '4xx',
  },
  {
    code: 418,
    phrase: "I'm a Teapot",
    description:
      "An April Fools' joke from RFC 2324; any attempt to brew coffee with a teapot should return this error.",
    category: '4xx',
  },
  {
    code: 421,
    phrase: 'Misdirected Request',
    description:
      'The request was directed at a server that is not able to produce a response for this combination of scheme and authority.',
    category: '4xx',
  },
  {
    code: 422,
    phrase: 'Unprocessable Content',
    description:
      'The request was well-formed but contains semantic errors — commonly returned by REST APIs when validation of the request body fails.',
    category: '4xx',
  },
  {
    code: 423,
    phrase: 'Locked',
    description:
      'The resource being accessed is locked (WebDAV); a LOCK request must be made before the resource can be modified.',
    category: '4xx',
  },
  {
    code: 424,
    phrase: 'Failed Dependency',
    description:
      'The request failed because it depended on another request that also failed (WebDAV).',
    category: '4xx',
  },
  {
    code: 425,
    phrase: 'Too Early',
    description:
      'The server is unwilling to risk processing a request that might be replayed, typically in TLS early data (0-RTT).',
    category: '4xx',
  },
  {
    code: 426,
    phrase: 'Upgrade Required',
    description:
      'The client should switch to a different protocol (specified in the Upgrade header) before making the request again.',
    category: '4xx',
  },
  {
    code: 428,
    phrase: 'Precondition Required',
    description:
      'The server requires the request to be conditional, typically to prevent lost-update problems with concurrent modifications.',
    category: '4xx',
  },
  {
    code: 429,
    phrase: 'Too Many Requests',
    description:
      'The client has sent too many requests in a given time window; the Retry-After header indicates when to try again.',
    category: '4xx',
  },
  {
    code: 431,
    phrase: 'Request Header Fields Too Large',
    description:
      'The server refuses to process the request because header fields are too large, individually or collectively.',
    category: '4xx',
  },
  {
    code: 451,
    phrase: 'Unavailable For Legal Reasons',
    description:
      'The server is denying access to the resource as a consequence of a legal demand (e.g. DMCA takedown, government-ordered censorship).',
    category: '4xx',
  },

  // 5xx Server Errors
  {
    code: 500,
    phrase: 'Internal Server Error',
    description:
      'The server encountered an unexpected condition that prevented it from fulfilling the request — the generic catch-all for server bugs.',
    category: '5xx',
  },
  {
    code: 501,
    phrase: 'Not Implemented',
    description:
      'The server does not support the HTTP method used in the request and cannot process it.',
    category: '5xx',
  },
  {
    code: 502,
    phrase: 'Bad Gateway',
    description:
      'The server, acting as a gateway or proxy, received an invalid response from an upstream server.',
    category: '5xx',
  },
  {
    code: 503,
    phrase: 'Service Unavailable',
    description:
      'The server is temporarily unable to handle the request due to overload or maintenance; Retry-After may indicate when to retry.',
    category: '5xx',
  },
  {
    code: 504,
    phrase: 'Gateway Timeout',
    description:
      'The server, acting as a gateway or proxy, did not receive a timely response from an upstream server.',
    category: '5xx',
  },
  {
    code: 505,
    phrase: 'HTTP Version Not Supported',
    description: 'The server does not support the HTTP protocol version used in the request.',
    category: '5xx',
  },
  {
    code: 506,
    phrase: 'Variant Also Negotiates',
    description:
      'The server has an internal configuration error where the chosen variant is itself configured to engage in content negotiation.',
    category: '5xx',
  },
  {
    code: 507,
    phrase: 'Insufficient Storage',
    description:
      'The server cannot store the representation needed to complete the request (WebDAV).',
    category: '5xx',
  },
  {
    code: 508,
    phrase: 'Loop Detected',
    description: 'The server detected an infinite loop while processing a request (WebDAV).',
    category: '5xx',
  },
  {
    code: 510,
    phrase: 'Not Extended',
    description: 'Further extensions to the request are required for the server to fulfil it.',
    category: '5xx',
  },
  {
    code: 511,
    phrase: 'Network Authentication Required',
    description:
      'The client needs to authenticate to gain network access, typically returned by captive portals on public Wi-Fi.',
    category: '5xx',
  },
];
