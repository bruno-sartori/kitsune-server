import { getDocs, collection, Firestore, documentId } from 'firebase/firestore';
import { query, where } from 'firebase/firestore';

class DeviceService {
  private db: Firestore | null = null;

  public setDb(db: Firestore) {
    this.db = db;
  }

  public async getAvailableDevices(userId: number) {
    const devices: any[] = [];

    const q = query(
      collection(this.db!, "devices"),
      where("group", "==", "light"),
      where("userId", "==", userId)
    );

    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      devices.push({ id: doc.id, ...data });
      console.log(`${doc.id} => ${data}`);
    });

    if (devices.length === 0) {
      return [];
    }

    return devices;
  }

  public async getDevicesByIds(deviceIds: Array<string>, userId: number) {
    const devices: any[] = [];

    const q = query(
      collection(this.db!, "devices"),
      where(documentId(), "in", deviceIds),
      where("userId", "==", userId)
    );
    
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`${doc.id} => ${data}`);
      devices.push({ id: doc.id, ...data });
    });

    if (devices.length === 0) {
      return [];
    }

    return devices;
  }
}

export default DeviceService;
