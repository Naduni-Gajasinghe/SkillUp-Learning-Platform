import http from 'http';
import app from './app';
import dotenv from 'dotenv';
import { initSocket } from './config/socket';

dotenv.config();

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

initSocket(server);

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Swagger documentation available at http://localhost:${PORT}/api-docs`);
});
