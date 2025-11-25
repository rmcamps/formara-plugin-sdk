/**
 * Prisma Adapter - Funciona en Standalone e Integrado
 *
 * Este adapter detecta automáticamente el contexto y usa el Prisma correcto:
 * - Standalone: usa Prisma local del plugin (../prisma/schema.prisma)
 * - Integrado: usa Prisma compartido del core (con todos los modelos)
 */
import { PrismaClient } from '@prisma/client';
/**
 * Obtener Prisma Client según el contexto
 */
export declare function getPrismaClient(): PrismaClient;
export declare const sharedPrisma: PrismaClient;
export { sharedPrisma as prisma };
//# sourceMappingURL=prisma-adapter.d.ts.map