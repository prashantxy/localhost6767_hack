import "dotenv/config";

import { ContextEngine } from "./engine/contextEngine";
import { IntentEngine } from "./engine/intentEngine";
import { startTestCollector } from "./collectors/testCollector";

const contextEngine = new ContextEngine();
const intentEngine = new IntentEngine();

contextEngine.start();
intentEngine.start();

startTestCollector();

console.log("🚀 MemoryLens Started");