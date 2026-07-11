import "dotenv/config";

import { ContextEngine } from "./engine/contextEngine";

import { startTestCollector } from "./collectors/testCollector";

const contextEngine = new ContextEngine();

contextEngine.start();

startTestCollector();

console.log("MemoryLens Started");