/**
 * Prisma Adapter - Funciona en Standalone e Integrado
 *
 * Este adapter detecta automáticamente el contexto y usa el Prisma correcto:
 * - Standalone: usa Prisma local del plugin (../prisma/schema.prisma)
 * - Integrado: usa Prisma compartido del core (con todos los modelos)
 */
import { PrismaClient } from '@prisma/client';
import * as path from 'path';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
// Crear require usando la ruta del archivo actual
const __filename = fileURLToPath(import.meta.url);
const require = createRequire(__filename);
let prismaInstance = null;
/**
 * Detectar si estamos en modo standalone o integrado
 */
function isStandaloneMode() {
    // En standalone: process.cwd() está en plugins/PLUGIN_NAME/backend/
    // En integrado: process.cwd() está en backend/ o formara/backend/
    const cwd = process.cwd();
    // Si cwd termina en 'backend' y NO está dentro de 'plugins', estamos integrados
    const isIntegrated = cwd.endsWith('/backend') || cwd.endsWith('/formara/backend');
    return !isIntegrated;
}
/**
 * Obtener Prisma Client según el contexto
 */
export function getPrismaClient() {
    if (prismaInstance) {
        return prismaInstance;
    }
    const standalone = isStandaloneMode();
    if (standalone) {
        // Modo standalone: usar Prisma local
        console.log('[Prisma] Modo standalone - usando base de datos local');
        prismaInstance = new PrismaClient({
            log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
        });
    }
    else {
        // Modo integrado: usar Prisma compartido del core
        console.log('[Prisma] Modo integrado - usando Prisma compartido del core');
        try {
            // En modo integrado, usar ruta absoluta para evitar problemas con symlinks
            const sharedPrismaPath = path.join(process.cwd(), 'src', 'services', 'prisma.shared.js');
            const sharedPrismaModule = require(sharedPrismaPath);
            const sharedPrisma = sharedPrismaModule.sharedPrisma || sharedPrismaModule.default;
            if (!sharedPrisma) {
                throw new Error('sharedPrisma is undefined en el módulo importado');
            }
            prismaInstance = sharedPrisma;
            console.log('[Prisma] ✅ Prisma compartido importado correctamente');
        }
        catch (error) {
            console.error('[Prisma] ❌ Error importando prisma.shared:', error.message);
            console.log('[Prisma] Fallback a PrismaClient local');
            // Fallback a local si falla
            prismaInstance = new PrismaClient();
        }
    }
    if (!prismaInstance) {
        throw new Error('PrismaClient no pudo ser inicializado');
    }
    return prismaInstance;
}
// Export por defecto para compatibilidad
// Llamar getPrismaClient() asegura que nunca sea null
export const sharedPrisma = getPrismaClient();
// Export named
export { sharedPrisma as prisma };
