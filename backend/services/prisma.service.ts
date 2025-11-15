/**
 * Servicio de Prisma compartido
 * 
 * IMPORTANTE: Esta instancia solo se crea si DATABASE_URL está configurada
 * En sandbox, el plugin debe configurar DATABASE_URL si necesita acceso a DB
 */

import { PrismaClient } from '@prisma/client';

let prismaInstance: PrismaClient | null = null;

/**
 * Lazy initialization de Prisma Client
 * Solo se crea cuando se accede por primera vez Y si DATABASE_URL existe
 */
function getPrismaClient(): PrismaClient {
  if (!prismaInstance) {
    // Verificar que DATABASE_URL esté configurada
    if (!process.env.DATABASE_URL) {
      console.warn('[SDK Prisma] ⚠️  DATABASE_URL no configurada. Prisma no disponible en sandbox.');
      console.warn('[SDK Prisma] ℹ️  Para usar DB en sandbox, configura DATABASE_URL en .env del plugin');
      // Retornar un mock que lanza error descriptivo
      return new Proxy({} as PrismaClient, {
        get: () => {
          throw new Error('Prisma no disponible: DATABASE_URL no configurada. Configure DATABASE_URL en .env del plugin.');
        }
      });
    }
    
    prismaInstance = new PrismaClient({
      log: ['error', 'warn'],
    });
    console.log('[SDK Prisma] ✓ PrismaClient inicializado con DATABASE_URL');
  }
  return prismaInstance;
}

/**
 * Instancia compartida de PrismaClient
 * Se inicializa lazy cuando se accede por primera vez
 */
export const sharedPrisma = new Proxy({} as PrismaClient, {
  get: (target, prop) => {
    const client = getPrismaClient();
    return (client as any)[prop];
  }
});

// Manejar desconexión al cerrar
process.on('beforeExit', async () => {
  await sharedPrisma.$disconnect();
});

// Export también PrismaClient para que plugins puedan crear instancias si necesitan
export { PrismaClient };

// Export como default para compatibilidad
export default sharedPrisma;


