import { Response } from 'express';

const clients = new Map<string, Set<Response>>();
const globalClients = new Set<Response>();

export const subscribe = (eventId: string, res: Response): void => {
  if (!clients.has(eventId)) clients.set(eventId, new Set());
  clients.get(eventId)!.add(res);
};

export const unsubscribe = (eventId: string, res: Response): void => {
  clients.get(eventId)?.delete(res);
  if (clients.get(eventId)?.size === 0) clients.delete(eventId);
};

export const subscribeGlobal = (res: Response): void => {
  globalClients.add(res);
};

export const unsubscribeGlobal = (res: Response): void => {
  globalClients.delete(res);
};

export const emit = (eventId: string, data: object): void => {
  const payload = `data: ${JSON.stringify(data)}\n\n`;
  clients.get(eventId)?.forEach((res) => res.write(payload));

  const globalPayload = `data: ${JSON.stringify({ eventId, ...data })}\n\n`;
  globalClients.forEach((res) => res.write(globalPayload));
};
