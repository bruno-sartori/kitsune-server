import { ExecuteIntent, QueryIntent, SyncIntent } from "@interfaces/google-intents";
import DeviceService from "./device.service";
import { collection, doc, setDoc, Firestore, onSnapshot } from "firebase/firestore";

class GoogleHomeService {
  private db: Firestore | null = null;
  private deviceService: DeviceService;

  constructor() {
    this.deviceService = new DeviceService();
  }

  public setDb(db: Firestore) {
    this.db = db;
    this.deviceService.setDb(db);
  }

  public async syncDevices(payload: SyncIntent, userId: number) {
    const devices = await this.deviceService.getAvailableDevices(userId);

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
          }
        })
      }
    };

    return data;
  }

  public async queryDevices(payload: QueryIntent, userId: number) {
    const deviceIds = payload.inputs[0].payload.devices;
    const devices = await this.deviceService.getDevicesByIds(deviceIds.map(o => o.id), userId);

    const data = {
      requestId: payload.requestId,
      payload: {
        agentUserId: userId.toString(),
        devices: devices.reduce((result: any, item, index, array) => {
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
  }

  public async execDevices(payload: ExecuteIntent, userId: number) {
    
    const intentRef = doc(collection(this.db!, 'intents'));
    await setDoc(intentRef, payload);
    console.log(`Created document with ID: ${intentRef.id}`);
    
    return new Promise((resolve, reject) => {
      try {
        // Watch for changes in the document
        const unsubscribe = onSnapshot(intentRef, async (doc) => {
          if (doc.exists()) {
            console.log("Current data: ", doc.data());
          } else {
            console.log("Intent executed!");
            const deviceIds = payload.inputs[0].payload.commands[0].devices.map(o => o.id);
            const devices = await this.deviceService.getDevicesByIds(deviceIds, userId);
            const data = {
              requestId: payload.requestId,
              payload: {
                commands: devices.map(device => {
                  return {
                    ids: [device.id],
                    status: 'SUCCESS',
                    states: {
                      online: true,
                      on: payload.inputs[0].payload.commands[0].execution[0].params.on,
                      brightness: payload.inputs[0].payload.commands[0].execution[0].params.brightness,
                      color: {
                        name: payload.inputs[0]?.payload?.commands[0]?.execution[0]?.params?.color?.name,
                        temperatureK: payload.inputs[0]?.payload?.commands[0]?.execution[0]?.params?.color?.temperatureK,
                        spectrumRgb: payload.inputs[0]?.payload?.commands[0]?.execution[0]?.params?.color?.spectrumRgb ?? 0
                      }
                    }
                  }
                })
              }
            };

            unsubscribe();
            resolve(data);
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }
}

export default GoogleHomeService;
