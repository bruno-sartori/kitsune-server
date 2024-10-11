"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const firestore_1 = require("firebase/firestore");
const firestore_2 = require("firebase/firestore");
class DeviceService {
    constructor(db) {
        this.db = null;
        this.db = db;
    }
    getAvailableDevices(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const devices = [];
            const q = (0, firestore_2.query)((0, firestore_1.collection)(this.db, "devices"), (0, firestore_2.where)("group", "==", "light"), (0, firestore_2.where)("userId", "==", userId));
            const querySnapshot = yield (0, firestore_1.getDocs)(q);
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                devices.push(Object.assign({ id: doc.id }, data));
                console.log(`${doc.id} => ${data}`);
            });
            if (devices.length === 0) {
                return [];
            }
            return devices;
        });
    }
    getDevicesByIds(deviceIds, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const devices = [];
            const q = (0, firestore_2.query)((0, firestore_1.collection)(this.db, "devices"), (0, firestore_2.where)((0, firestore_1.documentId)(), "in", deviceIds), (0, firestore_2.where)("userId", "==", userId));
            const querySnapshot = yield (0, firestore_1.getDocs)(q);
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                console.log(`${doc.id} => ${data}`);
                devices.push(Object.assign({ id: doc.id }, data));
            });
            if (devices.length === 0) {
                return [];
            }
            return devices;
        });
    }
}
exports.default = DeviceService;
