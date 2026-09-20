import { Request } from 'express';

interface IAuthenticatedUser {
  sub: number;
  email: string;
  tenantId: number;
  role: string;
}

export interface AuthenticatedRequest extends Request {
  user: IAuthenticatedUser;
}
