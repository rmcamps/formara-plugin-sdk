/**
 * Mock de servicio de generación de PDFs desde templates
 * En producción, el core usa la implementación real
 */

export const templatePDFService = {
  /**
   * Genera un PDF desde un template (mock)
   */
  async generatePDF(options: any): Promise<any> {
    console.log('[SDK Mock] templatePDFService.generatePDF:', options);
    return {
      success: true,
      filePath: '/mock/path/to/generated.pdf',
      filename: 'mock-document.pdf'
    };
  },
  
  /**
   * Carga un template desde archivo (mock)
   */
  async loadTemplateFromFile(templateId: number): Promise<string> {
    console.log('[SDK Mock] templatePDFService.loadTemplateFromFile:', templateId);
    return '<html><body>Mock Template</body></html>';
  }
};

