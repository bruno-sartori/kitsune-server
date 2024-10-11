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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const device_service_1 = __importDefault(require("./device.service"));
const firestore_1 = require("firebase/firestore");
class GoogleHomeService {
    constructor(db) {
        this.db = null;
        this.db = db;
        this.deviceService = new device_service_1.default(db);
    }
    syncDevices(payload, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const devices = yield this.deviceService.getAvailableDevices(userId);
            const data = {
                requestId: payload.requestId,
                payload: {
                    agentUserId: userId.toString(),
                    devices: devices.map(device => {
                        return {
                            id: device.id,
                            type: 'action.devices.types.LIGHT',
                            traits: [
                                'action.devices.traits.OnOff',
                                'action.devices.traits.ColorSetting',
                                'action.devices.traits.Brightness'
                            ],
                            name: {
                                name: device.name
                            },
                            willReportState: true,
                            attributes: {
                                colorTemperatureRange: {
                                    temperatureMinK: 2000,
                                    temperatureMaxK: 6500
                                }
                            },
                            deviceInfo: {
                                manufacturer: "smart-home-inc",
                                model: "hs1234",
                                hwVersion: "3.2",
                                swVersion: "11.4"
                            }
                        };
                    })
                }
            };
            return data;
        });
    }
    queryDevices(payload, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const deviceIds = payload.inputs[0].payload.devices;
            const devices = yield this.deviceService.getDevicesByIds(deviceIds.map(o => o.id), userId);
            const data = {
                requestId: payload.requestId,
                payload: {
                    agentUserId: userId.toString(),
                    devices: devices.reduce((result, item, index, array) => {
                        result[item.id] = {
                            status: 'SUCCESS',
                            online: item.online,
                            on: item.on,
                            brightness: item.brightness,
                            color: item.color
                        };
                        return result;
                    }, {}),
                }
            };
            return data;
        });
    }
    execDevices(payload, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const intentRef = (0, firestore_1.doc)((0, firestore_1.collection)(this.db, 'intents'));
            yield (0, firestore_1.setDoc)(intentRef, payload);
            console.log(`Created document with ID: ${intentRef.id}`);
            return new Promise((resolve, reject) => {
                try {
                    // Watch for changes in the document
                    const unsubscribe = (0, firestore_1.onSnapshot)(intentRef, (doc) => __awaiter(this, void 0, void 0, function* () {
                        if (doc.exists()) {
                            console.log("Current data: ", doc.data());
                        }
                        else {
                            console.log("Intent executed!");
                            const deviceIds = payload.inputs[0].payload.commands[0].devices.map(o => o.id);
                            const devices = yield this.deviceService.getDevicesByIds(deviceIds, userId);
                            const data = {
                                requestId: payload.requestId,
                                payload: {
                                    commands: devices.map(device => {
                                        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u;
                                        return {
                                            ids: [device.id],
                                            status: 'SUCCESS',
                                            states: {
                                                online: true,
                                                on: payload.inputs[0].payload.commands[0].execution[0].params.on,
                                                brightness: payload.inputs[0].payload.commands[0].execution[0].params.brightness,
                                                color: {
                                                    name: (_f = (_e = (_d = (_c = (_b = (_a = payload.inputs[0]) === null || _a === void 0 ? void 0 : _a.payload) === null || _b === void 0 ? void 0 : _b.commands[0]) === null || _c === void 0 ? void 0 : _c.execution[0]) === null || _d === void 0 ? void 0 : _d.params) === null || _e === void 0 ? void 0 : _e.color) === null || _f === void 0 ? void 0 : _f.name,
                                                    temperatureK: (_m = (_l = (_k = (_j = (_h = (_g = payload.inputs[0]) === null || _g === void 0 ? void 0 : _g.payload) === null || _h === void 0 ? void 0 : _h.commands[0]) === null || _j === void 0 ? void 0 : _j.execution[0]) === null || _k === void 0 ? void 0 : _k.params) === null || _l === void 0 ? void 0 : _l.color) === null || _m === void 0 ? void 0 : _m.temperatureK,
                                                    spectrumRgb: (_u = (_t = (_s = (_r = (_q = (_p = (_o = payload.inputs[0]) === null || _o === void 0 ? void 0 : _o.payload) === null || _p === void 0 ? void 0 : _p.commands[0]) === null || _q === void 0 ? void 0 : _q.execution[0]) === null || _r === void 0 ? void 0 : _r.params) === null || _s === void 0 ? void 0 : _s.color) === null || _t === void 0 ? void 0 : _t.spectrumRgb) !== null && _u !== void 0 ? _u : 0
                                                }
                                            }
                                        };
                                    })
                                }
                            };
                            unsubscribe();
                            resolve(data);
                        }
                    }));
                }
                catch (error) {
                    reject(error);
                }
            });
        });
    }
}
exports.default = GoogleHomeService;
