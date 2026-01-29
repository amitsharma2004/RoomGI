import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { logger } from '../../utils/index.js';
import { ViewerInfo } from './property.types.js';

export class PropertySocket {
  private io: SocketIOServer;
  private propertyViewers: Map<string, Map<string, ViewerInfo>> = new Map();

  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket: Socket) => {
      logger.info(`Socket connected: ${socket.id}`);

      socket.on('view_property', (propertyId: string) => {
        this.handleViewProperty(socket, propertyId);
      });

      socket.on('leave_property', (propertyId: string) => {
        this.handleLeaveProperty(socket, propertyId);
      });

      socket.on('disconnect', () => {
        this.handleDisconnect(socket);
      });
    });
  }

  private handleViewProperty(socket: Socket, propertyId: string) {
    // Join the property room
    socket.join(`property_${propertyId}`);

    // Add viewer to tracking
    if (!this.propertyViewers.has(propertyId)) {
      this.propertyViewers.set(propertyId, new Map());
    }

    const viewers = this.propertyViewers.get(propertyId)!;
    viewers.set(socket.id, {
      socketId: socket.id,
      joinedAt: new Date()
    });

    // Broadcast updated viewer count
    this.broadcastViewerCount(propertyId);

    logger.info(`Socket ${socket.id} viewing property ${propertyId}`);
  }

  private handleLeaveProperty(socket: Socket, propertyId: string) {
    socket.leave(`property_${propertyId}`);
    
    const viewers = this.propertyViewers.get(propertyId);
    if (viewers) {
      viewers.delete(socket.id);
      if (viewers.size === 0) {
        this.propertyViewers.delete(propertyId);
      }
    }

    this.broadcastViewerCount(propertyId);
    logger.info(`Socket ${socket.id} left property ${propertyId}`);
  }

  private handleDisconnect(socket: Socket) {
    // Remove from all property viewers
    for (const [propertyId, viewers] of this.propertyViewers.entries()) {
      if (viewers.has(socket.id)) {
        viewers.delete(socket.id);
        if (viewers.size === 0) {
          this.propertyViewers.delete(propertyId);
        } else {
          this.broadcastViewerCount(propertyId);
        }
      }
    }

    logger.info(`Socket disconnected: ${socket.id}`);
  }

  private broadcastViewerCount(propertyId: string) {
    const viewers = this.propertyViewers.get(propertyId);
    const viewerCount = viewers ? viewers.size : 0;

    this.io.to(`property_${propertyId}`).emit('viewer_count_updated', {
      propertyId,
      viewerCount,
      message: viewerCount > 1 ? `${viewerCount} people viewing now` : ''
    });
  }

  public broadcastAvailabilityUpdate(propertyId: string, bedsAvailable: number, totalBeds: number) {
    const urgencyLevel = bedsAvailable <= 2 ? 'critical' : 'normal';
    
    this.io.to(`property_${propertyId}`).emit('availability_updated', {
      propertyId,
      bedsAvailable,
      totalBeds,
      urgencyLevel,
      message: urgencyLevel === 'critical' 
        ? `Only ${bedsAvailable} beds left!` 
        : `${bedsAvailable} beds available`
    });

    logger.info(`Broadcasted availability update for property ${propertyId}: ${bedsAvailable}/${totalBeds} beds`);
  }

  public broadcastBookingActivity(propertyId: string, bedsBooked: number) {
    this.io.to(`property_${propertyId}`).emit('booking_activity', {
      propertyId,
      bedsBooked,
      timestamp: new Date(),
      message: `${bedsBooked} bed${bedsBooked > 1 ? 's' : ''} just booked!`
    });

    logger.info(`Broadcasted booking activity for property ${propertyId}: ${bedsBooked} beds booked`);
  }

  public getActiveViewers(propertyId: string): number {
    const viewers = this.propertyViewers.get(propertyId);
    return viewers ? viewers.size : 0;
  }

  public getIO(): SocketIOServer {
    return this.io;
  }
}