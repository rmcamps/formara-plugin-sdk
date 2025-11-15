/**
 * Servicio de Prisma compartido
 */

import { PrismaClient } from '@prisma/client';

/**
 * Instancia compartida de PrismaClient
 * Debe ser usada por todos los plugins para garantizar una sola conexión
 */
export const sharedPrisma = new PrismaClient({
  log: ['error', 'warn'],
});

// Manejar desconexión al cerrar
process.on('beforeExit', async () => {
  await sharedPrisma.$disconnect();
});

// Export también PrismaClient para que plugins puedan crear instancias si necesitan
export { PrismaClient };

// Export como default para compatibilidad
export default sharedPrisma;


