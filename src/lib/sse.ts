type Controller = ReadableStreamDefaultController;
const connections: Record<string, Controller[]> = {};

export function addConnection(conversationId: string, controller: Controller) {
  if (!connections[conversationId]) connections[conversationId] = [];
  connections[conversationId].push(controller);
}

export function removeConnection(conversationId: string, controller: Controller) {
  connections[conversationId] = (connections[conversationId] || []).filter(
    (c) => c !== controller
  );
}

export function pushMessage(conversationId: string, message: any) {
  const encoder = new TextEncoder();
  const payload = encoder.encode(`data: ${JSON.stringify(message)}\n\n`);

  (connections[conversationId] || []).forEach((controller) =>
    controller.enqueue(payload)
  );
}
