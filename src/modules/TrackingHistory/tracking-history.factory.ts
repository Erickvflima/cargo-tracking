import { TrackingHistoryEntity } from './entities/trackingHistory.entity';

export class TrackingHistoryFactory {
  static toResponse(history: TrackingHistoryEntity) {
    return {
      id: history.id,
      trackingId: history.trackingId,
      trackingCode: history.tracking?.trackingCode,
      status: history.status,
      occurredAt: history.occurredAt,
      latitude: history.latitude,
      longitude: history.longitude,
      observation: history.observation,
      createdAt: history.createdAt,
      createdBy: history.createdBy,
    };
  }

  static toResponseList(history: TrackingHistoryEntity[]) {
    return history.map((item) => this.toResponse(item));
  }
}
