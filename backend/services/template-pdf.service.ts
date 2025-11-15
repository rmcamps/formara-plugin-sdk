/**
 * Mock de servicio de generación de PDFs desde templates
 * En producción, el core usa la implementación real
 */

export const templatePDFService = {
  /**
   * Genera un PDF desde un template (mock)
   */
  async generatePDF(options: any): Promise<string> {
    console.log('[SDK Mock] templatePDFService.generatePDF:', options);
    return '/mock/path/to/generated.pdf';
  }
};

