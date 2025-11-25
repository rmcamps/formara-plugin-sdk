/**
 * Contratos Backend para Plugins de Formara
 *
 * Este archivo re-exporta todas las interfaces backend del core.
 * En desarrollo (monorepo), usa symlinks a las interfaces del core.
 * En producción (npm package), contiene copias de las interfaces.
 */
export * from './actions';
export * from './hooks';
export * from './integrations';
export type { ActionDefinition, ActionContextData, ActionResult, ActionContext, ActionRegistry } from './actions';
export type { HookDefinition, HookEvent, HookEventData, HookResult, FileEventData, DocumentEventData, FormRecordEventData, FormEventData, HookRegistry } from './hooks';
export type { IntegrationDefinition, IntegrationConfig, IntegrationRegistry, IntegrationsListResponse } from './integrations';
//# sourceMappingURL=index.d.ts.map