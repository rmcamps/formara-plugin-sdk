/**
 * Mock de servicio de PubSub para desarrollo
 */

/**
 * Publica un mensaje de control de WhatsApp (mock)
 */
export async function publishWhatsappControl(action: string, data: any): Promise<{ success: boolean }> {
  console.log('[SDK Mock PubSub] publishWhatsappControl:', action, data);
  return { success: true };
}

/**
 * Publica una tarea de procesamiento de documento (mock)
 */
export async function publishDocTask(payload: {
  documentId: number;
  formId: number;
  force?: boolean;
}): Promise<{ success: boolean }> {
  console.log('[SDK Mock PubSub] publishDocTask:', payload);
  return { success: true };
}


