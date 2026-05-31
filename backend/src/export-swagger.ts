import { swaggerSpec } from './config/swagger';
import fs from 'fs';
import path from 'path';

const outputPath = path.join(process.cwd(), 'swagger-spec.json');
fs.writeFileSync(outputPath, JSON.stringify(swaggerSpec, null, 2));

console.log(`Swagger spec exported to ${outputPath}`);
process.exit(0);
