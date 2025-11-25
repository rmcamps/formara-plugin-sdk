/**
 * Mock de servicio de Cloud Tasks para desarrollo
 */

interface DocumentProcessingPayload {
  documentId: number;
  formId: number;
  workspaceId: number;
  filePath?: string;
}

/**
 * Servicio mock de Cloud Tasks
 */
export const cloudTasksService = {
  /**
   * Encola un documento para procesamiento (mock)
   */
  async enqueueDocumentProcessing(payload: DocumentProcessingPayload): Promise<{ success: boolean }> {
    console.log('[SDK Mock Cloud Tasks] enqueueDocumentProcessing:', payload);
    
    // En sandbox, simular que se envió correctamente
    return { success: true };
  },
};


