"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("@interfaces/types");
const http_status_1 = __importDefault(require("http-status"));
class ApiError extends Error {
    constructor(message, code = 'API_ERROR', statusCode = http_status_1.default.UNPROCESSABLE_ENTITY) {
        super(message);
        this.code = types_1.ERROR_CODE[code];
        this.statusCode = statusCode;
    }
    toJSON() {
        return {
            message: this.message,
            code: this.code,
            statusCode: this.statusCode,
        };
    }
}
exports.default = ApiError;
