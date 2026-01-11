export type UnlistenFn = () => void;

type TauriListenResult = { unlisten: UnlistenFn };

type TauriEventApi = {
  listen: (eventName: string, handler: (event: { payload: unknown }) => void) => Promise<TauriListenResult>;
};

type TauriApi = {
  invoke: <T>(command: string, args?: Record<string, unknown>) => Promise<T>;
  event: TauriEventApi;
};

function getTauriApi(): TauriApi | null {
  const w = window as unknown as { __TAURI__?: TauriApi };
  if (!w.__TAURI__) return null;
  if (typeof w.__TAURI__.invoke !== 'function') return null;
  if (!w.__TAURI__.event || typeof w.__TAURI__.event.listen !== 'function') return null;
  return w.__TAURI__;
}

export function isTauri(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(getTauriApi());
}

export async function tauriInvoke<T>(command: string, args?: Record<string, unknown>): Promise<T> {
  const api = getTauriApi();
  if (!api) throw new Error('Tauri API not available');
  return api.invoke<T>(command, args);
}

export async function tauriListen<T>(eventName: string, handler: (payload: T) => void): Promise<UnlistenFn> {
  const api = getTauriApi();
  if (!api) throw new Error('Tauri API not available');
  const res = await api.event.listen(eventName, (event) => handler(event.payload as T));
  return res.unlisten;
}
