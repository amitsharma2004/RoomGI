import { Request, Response } from 'express';
import { RoomService } from './room.service.js';

export class RoomController {
  private roomService = new RoomService();

  async createRoom(req: Request, res: Response) {
    try {
      const room = await this.roomService.createRoom(req.body);
      res.status(201).json(room);
    } catch (error) {
      res.status(400).json({ error: 'Failed to create room' });
    }
  }

  async getRoom(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const room = await this.roomService.getRoomById(id);
      if (!room) {
        return res.status(404).json({ error: 'Room not found' });
      }
      res.json(room);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}