"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/api/users/index.ts
var users_exports = {};
__export(users_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(users_exports);
var import_client_dynamodb = require("@aws-sdk/client-dynamodb");
var import_lib_dynamodb = require("@aws-sdk/lib-dynamodb");

// src/api/users/node_modules/uuid/dist/esm/stringify.js
var byteToHex = [];
for (let i = 0; i < 256; ++i) {
  byteToHex.push((i + 256).toString(16).slice(1));
}
function unsafeStringify(arr, offset = 0) {
  return (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + "-" + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + "-" + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + "-" + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + "-" + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase();
}

// src/api/users/node_modules/uuid/dist/esm/rng.js
var import_crypto = require("crypto");
var rnds8Pool = new Uint8Array(256);
var poolPtr = rnds8Pool.length;
function rng() {
  if (poolPtr > rnds8Pool.length - 16) {
    (0, import_crypto.randomFillSync)(rnds8Pool);
    poolPtr = 0;
  }
  return rnds8Pool.slice(poolPtr, poolPtr += 16);
}

// src/api/users/node_modules/uuid/dist/esm/native.js
var import_crypto2 = require("crypto");
var native_default = { randomUUID: import_crypto2.randomUUID };

// src/api/users/node_modules/uuid/dist/esm/v4.js
function v4(options, buf, offset) {
  if (native_default.randomUUID && !buf && !options) {
    return native_default.randomUUID();
  }
  options = options || {};
  const rnds = options.random ?? options.rng?.() ?? rng();
  if (rnds.length < 16) {
    throw new Error("Random bytes length must be >= 16");
  }
  rnds[6] = rnds[6] & 15 | 64;
  rnds[8] = rnds[8] & 63 | 128;
  if (buf) {
    offset = offset || 0;
    if (offset < 0 || offset + 16 > buf.length) {
      throw new RangeError(`UUID byte range ${offset}:${offset + 15} is out of buffer bounds`);
    }
    for (let i = 0; i < 16; ++i) {
      buf[offset + i] = rnds[i];
    }
    return buf;
  }
  return unsafeStringify(rnds);
}
var v4_default = v4;

// src/api/users/index.ts
var USERS_TABLE = process.env.USERS_TABLE || "";
var dynamoDb = new import_client_dynamodb.DynamoDBClient({});
var documentClient = import_lib_dynamodb.DynamoDBDocumentClient.from(dynamoDb);
var handler = (event, context) => {
  let response;
  switch (`${event.httpMethod} ${event.resource}`) {
    case "POST /users" /* CREATE_USER */:
      response = createUser(event);
      break;
    case "DELETE /users/{userid}" /* DELETE_USER */:
      response = deleteUser(event);
      break;
    case "GET /users/{userid}" /* GET_USER */:
      response = getUser(event);
      break;
    case "GET /users" /* GET_USERS */:
      response = getUsers();
      break;
    case "PUT /users/{userid}" /* UPDATE_USER */:
      response = updateUser(event);
      break;
    default:
      response = Promise.resolve({
        statusCode: 400,
        headers: { ...defaultHeaders },
        body: JSON.stringify({
          message: "Unsupported route"
        })
      });
      break;
  }
  return response.catch((error) => {
    console.log(error);
    return {
      statusCode: 400,
      headers: { ...defaultHeaders },
      body: JSON.stringify({ "Error": error })
    };
  });
};
var defaultHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*"
};
var createUser = (event) => {
  const body = JSON.parse(event.body || "{}");
  body["timestamp"] = (/* @__PURE__ */ new Date()).toISOString();
  body["userid"] = v4_default();
  return documentClient.send(new import_lib_dynamodb.PutCommand({
    TableName: USERS_TABLE,
    Item: {
      ...body
    }
  })).then(() => {
    return {
      statusCode: 201,
      headers: { ...defaultHeaders },
      body: JSON.stringify(body)
    };
  });
};
var deleteUser = (event) => {
  const { userid } = event.pathParameters || {};
  return documentClient.send(new import_lib_dynamodb.DeleteCommand({
    TableName: USERS_TABLE,
    Key: {
      "userid": userid
    }
  })).then(() => {
    return {
      statusCode: 200,
      headers: { ...defaultHeaders },
      body: JSON.stringify({})
    };
  });
};
var getUser = (event) => {
  const { userid } = event.pathParameters || {};
  return documentClient.send(new import_lib_dynamodb.GetCommand({
    TableName: USERS_TABLE,
    Key: {
      "userid": userid
    }
  })).then((data) => {
    return {
      statusCode: 200,
      headers: { ...defaultHeaders },
      body: JSON.stringify(data.Item || {})
    };
  });
};
var getUsers = () => {
  return documentClient.send(new import_lib_dynamodb.ScanCommand({
    TableName: USERS_TABLE,
    Select: "ALL_ATTRIBUTES"
  })).then((data) => {
    return {
      statusCode: 200,
      headers: { ...defaultHeaders },
      body: JSON.stringify(data.Items)
    };
  });
};
var updateUser = (event) => {
  const { userid } = event.pathParameters || {};
  const body = JSON.parse(event.body || "{}");
  body["timestamp"] = (/* @__PURE__ */ new Date()).toISOString();
  body["userid"] = userid;
  return documentClient.send(new import_lib_dynamodb.PutCommand({
    TableName: USERS_TABLE,
    Item: {
      ...body
    }
  })).then(() => {
    return {
      statusCode: 200,
      headers: { ...defaultHeaders },
      body: JSON.stringify(body)
    };
  });
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
