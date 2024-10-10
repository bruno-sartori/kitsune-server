export type SyncIntent = {
  requestId: string,
  inputs: Array<{
    intent: string
  }>
};

type IntentDevice = {
  id: string;
};

export type QueryIntent = {
  requestId: string,
  inputs: Array<{
    intent: string,
    payload: {
      devices: Array<IntentDevice>
    }
  }>
};

export type ExecuteIntent = {
  requestId: string,
  inputs: Array<{
    intent: string,
    payload: {
      commands: Array<{
        devices: Array<IntentDevice>,
        execution: Array<{
          command: string,
          params: {
            on?: boolean,
            brightness?: number,
            color?: {
              name?: string,
              temperatureK?: number,
              spectrumRgb?: number
            }
          }
        }>
      }>
    }
  }>
};
