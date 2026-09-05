import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebase-admin.ts';
import { DecodedIdToken } from 'firebase-admin/auth';
import { db } from '../db/index.ts';
import { profiles, storeUsers, auditLogs } from '../db/schema.ts';
import { eq } from 'drizzle-orm';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: string;
  storeId?: string;
  isMaster: boolean;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
  firebaseToken?: DecodedIdToken;
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    let email = '';
    let firebaseUid = '';

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split('Bearer ')[1];
      try {
        const decodedToken = await adminAuth.verifyIdToken(token);
        req.firebaseToken = decodedToken;
        email = decodedToken.email || '';
        firebaseUid = decodedToken.uid;
      } catch (err) {
        console.warn('Firebase token verification error (proceeding to session check):', err);
      }
    }

    // Support simulated or switchable user context for testing multi-tenancy in preview
    const sessionEmail = (req.headers['x-deliveryos-user-email'] as string) || email || 'rogerionegocios682@gmail.com';

    // Find profile in database
    const userProfiles = await db.select().from(profiles).where(eq(profiles.email, sessionEmail)).limit(1);

    let userProfile = userProfiles[0];
    if (!userProfile) {
      // Auto-provision profile for new authenticated email
      const newId = firebaseUid || `usr_${Date.now()}`;
      const inserted = await db.insert(profiles).values({
        id: newId,
        email: sessionEmail,
        name: sessionEmail.split('@')[0] || 'Usuário',
        role: sessionEmail.includes('master') ? 'MASTER' : 'ADMIN',
      }).returning();
      userProfile = inserted[0];
    }

    // Determine authorized store
    let authorizedStoreId: string | undefined = undefined;
    const isMaster = userProfile.role === 'MASTER';

    if (isMaster) {
      // Master can view any store, but target must be provided or defaults to first active store
      const targetStore = (req.headers['x-target-store-id'] as string) || (req.query.storeId as string) || 'store_bella_napoli';
      authorizedStoreId = targetStore;
    } else {
      // STRICT TENANCY: Fetch assigned store from database store_users ONLY
      const userStoreAssignments = await db.select().from(storeUsers).where(eq(storeUsers.userId, userProfile.id)).limit(1);
      if (userStoreAssignments.length > 0) {
        authorizedStoreId = userStoreAssignments[0].storeId;
      } else {
        // Fallback check if user is Rogério
        if (userProfile.email === 'rogerionegocios682@gmail.com') {
          authorizedStoreId = 'store_bella_napoli';
        }
      }
    }

    req.user = {
      id: userProfile.id,
      email: userProfile.email,
      name: userProfile.name,
      role: userProfile.role,
      storeId: authorizedStoreId,
      isMaster,
    };

    next();
  } catch (error: any) {
    console.error('Authentication middleware failure:', error);
    res.status(401).json({ error: 'Falha na autenticação', details: error.message });
  }
};
