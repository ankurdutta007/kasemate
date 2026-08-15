import handler from './api/chat.ts';
import { config } from 'dotenv';
config();

const req = {
  method: 'POST',
  body: {
    case_id: 'c-1002',
    is_initialization: true,
    interviewer_name: 'Test'
  },
  env: process.env
};

const res = {
  status: function(code) { this.statusCode = code; return this; },
  json: function(data) { console.log('Response:', this.statusCode || 200, data); return this; }
};

handler(req as any, res as any).catch(console.error);
