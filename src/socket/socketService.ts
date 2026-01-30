import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';

interface ViewerData {
  propertyId: string;
  socketId: string;
  timestamp: number;
}

class SocketService {
  private io: SocketIOServer | null = null;
  private viewers: Map<string, ViewerData[]> = new Map(); // propertyId -> viewers
  private socketToProperty: Map<string, string> = new Map(); // socketId -> propertyId

  initialize(server: HTTPServer): void {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    this.io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      // Handle property viewing
      socket.on('view_property', (data: { propertyId: string }) => {
        this.handleViewProperty(socket.id, data.propertyId);
      });

      // Handle leaving property
      socket.on('leave_property', (data: { propertyId: string }) => {
        this.handleLeaveProperty(socket.id, data.propertyId);
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        this.handleDisconnect(socket.id);
      });
    });

    // Clean up old viewers every 30 seconds
    setInterval(() => {
      this.cleanupOldViewers();
    }, 30000);
  }

  private handleViewProperty(socketId: string, propertyId: string): void {
    // Remove from previous property if any
    const previousProperty = this.socketToProperty.get(socketId);
    if (previousProperty) {
      this.handleLeaveProperty(socketId, previousProperty);
    }

    // Add to new property
    if (!this.viewers.has(propertyId)) {
      this.viewers.set(propertyId, []);
    }

    const viewers = this.viewers.get(propertyId)!;
    const existingViewer = viewers.find(v => v.socketId === socketId);
    
    if (!existingViewer) {
      viewers.push({
        propertyId,
        socketId,
        timestamp: Date.now()
      });
      
      this.socketToProperty.set(socketId, propertyId);
      
      // Emit updated count to all viewers of this property
      this.emitViewerCount(propertyId);
    }
  }

  private handleLeaveProperty(socketId: string, propertyId: string): void {
    const viewers = this.viewers.get(propertyId);
    if (viewers) {
      const index = viewers.findIndex(v => v.socketId === socketId);
      if (index !== -1) {
        viewers.splice(index, 1);
        this.socketToProperty.delete(socketId);
        
        // Emit updated count
        this.emitViewerCount(propertyId);
        
        // Clean up empty property
        if (viewers.length === 0) {
          this.viewers.delete(propertyId);
        }
      }
    }
  }

  private handleDisconnect(socketId: string): void {
    const propertyId = this.socketToProperty.get(socketId);
    if (propertyId) {
      this.handleLeaveProperty(socketId, propertyId);
    }
  }

  private cleanupOldViewers(): void {
    const now = Date.now();
    const maxAge = 5 * 60 * 1000; // 5 minutes

    for (const [propertyId, viewers] of this.viewers.entries()) {
      const activeViewers = viewers.filter(v => now - v.timestamp < maxAge);
      
      if (activeViewers.length !== viewers.length) {
        if (activeViewers.length === 0) {
          this.viewers.delete(propertyId);
        } else {
          this.viewers.set(propertyId, activeViewers);
        }
        
        // Update socket mapping
        viewers.forEach(v => {
          if (now - v.timestamp >= maxAge) {
            this.socketToProperty.delete(v.socketId);
          }
        });
        
        this.emitViewerCount(propertyId);
      }
    }
  }

  private emitViewerCount(propertyId: string): void {
    if (!this.io) return;
    
    const count = this.viewers.get(propertyId)?.length || 0;
    this.io.emit('viewer_count_updated', { propertyId, count });
  }

  // Public methods for external use
  emitAvailabilityUpdate(propertyId: string, bedsAvailable: number): void {
    if (!this.io) return;
    
    this.io.emit('availability_updated', { propertyId, bedsAvailable });
  }

  emitBookingActivity(propertyId: string, message: string): void {
    if (!this.io) return;
    
    this.io.emit('booking_activity', { 
      propertyId, 
      message, 
      timestamp: new Date().toISOString() 
    });
  }

  emitViewerCountUpdated(propertyId: string, count: number): void {
    if (!this.io) return;
    
    this.io.emit('viewer_count_updated', { propertyId, count });
  }

  getViewerCount(propertyId: string): number {
    return this.viewers.get(propertyId)?.length || 0;
  }

  getIO(): SocketIOServer | null {
    return this.io;
  }
}

export const socketService = new SocketService();