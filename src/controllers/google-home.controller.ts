import ApiError from "@errors/ApiError";
import GoogleHomeService from "@services/google-home.service";
import { Request, Response } from "express";

const googleHomeService = new GoogleHomeService();

class GoogleHomeController {
  public async init(req: Request, res: Response, next: any) {
    const { firebase } = req;
    googleHomeService.setDb(firebase);
    next();
  }

  public async execIntent(req: Request, res: Response) {
    const payload = req.body;
    let { user } = req;

    if (!user) {
      user = {
        id: 1,
        name: 'Bruno Sartori',
        login: 'brunosartori.dev@gmail.com',
        password: '$2a$10$MmHGsvxXz16IfxgvVVZUQew1fM2LlDCBzCXex/mzIPFIYFKzvVodi',
        createdAt: '2024-10-09T15:15:57.000Z',
        updatedAt: '2024-10-09T15:15:57.000Z'
      };
    }

    try {
      switch(payload.inputs[0].intent) {
        case 'action.devices.SYNC': {
          const response = await googleHomeService.syncDevices(payload, user.id);
          res.status(200).json({ data: response });
        } break;
        case 'action.devices.QUERY': {
          const response = await googleHomeService.queryDevices(payload, user.id);
          res.status(200).json({ data: response });
        } break;
        case 'action.devices.EXECUTE': {
          const response = await googleHomeService.execDevices(payload, user.id);
          res.status(200).json({ data: response });
        } break;
      }

    } catch (error) {
      console.error("Error executing intent:", error);
      const newError = new ApiError("Error executing intent", "INTERNAL_SERVER_ERROR");
      res.status(newError.statusCode).json({ error: newError.toJSON() });
    }
  }
}

export default GoogleHomeController;
