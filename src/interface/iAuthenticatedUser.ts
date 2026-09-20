import { UserRole } from '@common/enums/roles';
import { Request } from 'express';

interface IAuthenticatedUser {
  sub: number;
  email: string;
  tenantId: number;
  role: UserRole;
}

export interface AuthenticatedRequest extends Request {
  user: IAuthenticatedUser;
}
