"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_1 = __importDefault(require("http-status"));
const ApiError_1 = __importDefault(require("./ApiError"));
class UnauthorizedError extends ApiError_1.default {
    constructor(message, code) {
        super(message || 'Unauthorized', code || 'UNAUTHORIZED', http_status_1.default.UNAUTHORIZED);
    }
}
exports.default = UnauthorizedError;
