"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_1 = __importDefault(require("http-status"));
const ApiError_1 = __importDefault(require("./ApiError"));
class ResourceNotFoundError extends ApiError_1.default {
    constructor() {
        super('Este recurso não foi encontrado ou foi excluído.', 'NOT_FOUND', http_status_1.default.NOT_FOUND);
    }
}
exports.default = ResourceNotFoundError;
