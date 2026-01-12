import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { MemoryStorage } from '../storage/memory.js';

export class StreamingServer {
  private wss: WebSocketServer;
  private storage: MemoryStorage;
  private intervals: Map<string, NodeJS.Timeout> = new Map();

  constructor(httpServer: Server) {
    this.wss = new WebSocketServer({ server: httpServer });
    this.storage = new MemoryStorage();
    this.setupWebSocketServer();
  }

  private setupWebSocketServer() {
    this.wss.on('connection', (ws: WebSocket, req) => {
      console.log(`🔌 WebSocket client connected: ${req.url}`);
      
      const clientId = this.generateClientId();
      
      ws.on('message', async (message) => {
        try {
          const data = JSON.parse(message.toString());
          await this.handleClientMessage(ws, clientId, data);
        } catch (error) {
          ws.send(JSON.stringify({ 
            type: 'error', 
            message: 'Invalid message format' 
          }));
        }
      });

      ws.on('close', () => {
        console.log(`🔌 WebSocket client disconnected: ${clientId}`);
        this.stopStreaming(clientId);
      });

      // Send initial data
      this.sendInitialData(ws);
    });

    console.log('🚀 WebSocket streaming server started');
  }

  private async handleClientMessage(ws: WebSocket, clientId: string, data: any) {
    switch (data.type) {
      case 'subscribe':
        await this.startStreaming(ws, clientId, data.payload);
        break;
      case 'unsubscribe':
        this.stopStreaming(clientId);
        break;
      case 'get_snapshot':
        await this.sendSnapshot(ws);
        break;
      default:
        ws.send(JSON.stringify({ 
          type: 'error', 
          message: 'Unknown message type' 
        }));
    }
  }

  private async startStreaming(ws: WebSocket, clientId: string, payload: any) {
    const { timeRange = '1h', endpoint, interval = 5000 } = payload;
    
    // Stop existing stream for this client
    this.stopStreaming(clientId);
    
    // Start new streaming interval
    const streamInterval = setInterval(async () => {
      try {
        const metrics = await this.storage.getMetrics(endpoint, timeRange);
        const analytics = this.calculateRealTimeAnalytics(metrics);
        
        ws.send(JSON.stringify({
          type: 'stream_update',
          clientId,
          timestamp: new Date().toISOString(),
          data: analytics
        }));
      } catch (error) {
        ws.send(JSON.stringify({
          type: 'stream_error',
          clientId,
          error: 'Failed to fetch metrics'
        }));
      }
    }, interval);

    this.intervals.set(clientId, streamInterval);
    
    ws.send(JSON.stringify({
      type: 'subscription_confirmed',
      clientId,
      payload: { timeRange, endpoint, interval }
    }));
  }

  private stopStreaming(clientId: string) {
    const interval = this.intervals.get(clientId);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(clientId);
    }
  }

  private async sendInitialData(ws: WebSocket) {
    try {
      const metrics = await this.storage.getMetrics();
      const analytics = this.calculateRealTimeAnalytics(metrics);
      
      ws.send(JSON.stringify({
        type: 'initial_data',
        timestamp: new Date().toISOString(),
        data: analytics
      }));
    } catch (error) {
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Failed to load initial data'
      }));
    }
  }

  private async sendSnapshot(ws: WebSocket) {
    try {
      const metrics = await this.storage.getMetrics();
      const analytics = this.calculateRealTimeAnalytics(metrics);
      
      ws.send(JSON.stringify({
        type: 'snapshot',
        timestamp: new Date().toISOString(),
        data: analytics
      }));
    } catch (error) {
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Failed to generate snapshot'
      }));
    }
  }

  private calculateRealTimeAnalytics(metrics: any[]) {
    if (metrics.length === 0) {
      return {
        totalRequests: 0,
        averageResponseTime: 0,
        errorRate: 0,
        activeConnections: this.wss.clients.size,
        lastUpdated: new Date().toISOString()
      };
    }

    const totalRequests = metrics.length;
    const averageResponseTime = metrics.reduce((sum, m) => sum + m.responseTime, 0) / totalRequests;
    const errorCount = metrics.filter(m => m.statusCode >= 400).length;
    const errorRate = (errorCount / totalRequests) * 100;

    return {
      totalRequests,
      averageResponseTime: Math.round(averageResponseTime * 100) / 100,
      errorRate: Math.round(errorRate * 100) / 100,
      activeConnections: this.wss.clients.size,
      lastUpdated: new Date().toISOString(),
      recentMetrics: metrics.slice(-10) // Last 10 metrics
    };
  }

  private generateClientId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  broadcast(data: any) {
    this.wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  }

  close() {
    // Clear all intervals
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals.clear();
    
    // Close WebSocket server
    this.wss.close();
  }
}
