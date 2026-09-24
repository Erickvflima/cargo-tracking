import { describe, it, expect, beforeEach, jest } from '@jest/globals';

import { TrackingService } from './tracking.service';
import { TrackingEntity } from './entities/tracking.entity';

jest.mock('@modules/Tenant/tenant.service', () => ({
  TenantService: class TenantService {},
}));

jest.mock('@common/errors/handle-error.util', () => ({
  handleError: jest.fn((error) => error),
}));

describe('TrackingService', () => {
  let trackingService: TrackingService;

  let tenantRepositoryFactory: {
    getRepository: ReturnType<typeof jest.fn>;
  };

  let tenantService: {
    findById: ReturnType<typeof jest.fn>;
  };

  let trackingHistoryService: {
    create: ReturnType<typeof jest.fn>;
  };

  let trackingRepository: {
    findOne: ReturnType<typeof jest.fn>;
    find: ReturnType<typeof jest.fn>;
    create: ReturnType<typeof jest.fn>;
    save: ReturnType<typeof jest.fn>;
  };

  beforeEach(() => {
    tenantRepositoryFactory = {
      getRepository: jest.fn(),
    };

    tenantService = {
      findById: jest.fn(),
    };

    trackingHistoryService = {
      create: jest.fn(),
    };

    trackingRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    trackingService = new TrackingService(
      tenantRepositoryFactory as never,
      tenantService as never,
      trackingHistoryService as never,
    );

    tenantRepositoryFactory.getRepository.mockImplementation(
      () => trackingRepository,
    );
  });

  describe('create', () => {
    it('should create a tracking successfully', async () => {
      tenantService.findById.mockResolvedValue({
        status: 'success',
        data: {
          id: 1,
          name: 'Tenant Test',
          schemaName: 'tenant_001',
          active: true,
        },
      });

      trackingRepository.findOne.mockResolvedValue(null);

      const trackingData = {
        trackingCode: 'TRK-001',
        originCity: 'Belo Horizonte',
        originCountry: 'BR',
        destinationCity: 'São Paulo',
        destinationCountry: 'BR',
        departureAt: '2026-09-24T08:00:00.000Z',
        estimatedDeliveryAt: '2026-10-01T00:00:00.000Z',
        status: 'PENDING',
      };

      const createdTracking = {
        id: 1,
        trackingCode: 'TRK-001',
        originCity: 'Belo Horizonte',
        originCountry: 'BR',
        destinationCity: 'São Paulo',
        destinationCountry: 'BR',
        departureAt: '2026-09-24T08:00:00.000Z',
        estimatedDeliveryAt: '2026-10-01T00:00:00.000Z',
        status: 'PENDING',
        createdBy: 'user@test.com',
      };

      trackingRepository.create.mockReturnValue(createdTracking);
      trackingRepository.save.mockResolvedValue(createdTracking);

      const result = await trackingService.create(
        1,
        'user@test.com',
        trackingData,
      );

      expect(result).toEqual({
        status: 'success',
        message: 'Cargo created successfully',
        document: createdTracking,
      });

      expect(tenantService.findById).toHaveBeenCalledWith(1);

      expect(tenantRepositoryFactory.getRepository).toHaveBeenCalledWith(
        'tenant_001',
        TrackingEntity,
      );

      expect(trackingRepository.findOne).toHaveBeenCalledWith({
        where: {
          trackingCode: 'TRK-001',
        },
      });

      expect(trackingRepository.create).toHaveBeenCalledWith({
        ...trackingData,
        createdBy: 'user@test.com',
      });

      expect(trackingRepository.save).toHaveBeenCalledWith(createdTracking);
    });
  });

  describe('findAll', () => {
    it('should list all trackings successfully', async () => {
      tenantService.findById.mockResolvedValue({
        status: 'success',
        data: {
          id: 1,
          name: 'Tenant Test',
          schemaName: 'tenant_001',
          active: true,
        },
      });

      const trackings = [
        {
          id: 1,
          trackingCode: 'TRK-001',
          status: 'PENDING',
        },
        {
          id: 2,
          trackingCode: 'TRK-002',
          status: 'IN_TRANSIT',
        },
      ];

      trackingRepository.find.mockResolvedValue(trackings);

      const result = await trackingService.findAll(1);

      expect(result).toEqual({
        status: 'success',
        message: 'Cargos found successfully',
        document: trackings,
      });

      expect(tenantService.findById).toHaveBeenCalledWith(1);

      expect(tenantRepositoryFactory.getRepository).toHaveBeenCalledWith(
        'tenant_001',
        TrackingEntity,
      );

      expect(trackingRepository.find).toHaveBeenCalledWith();
    });
  });
});
