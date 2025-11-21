import { initializeSystem } from "./core/initialize.core.js";
import { initApp } from "./core/initApp.core.js";
import { config } from "./config/env.config.js";
import { logger } from "./config/logger.config.js";
const bootstrap = async () => {
  try {
    await initializeSystem();
    const app = initApp();
    const port = config.port || 5000;
    app.listen(port, () => console.log(`🚀 Server running on ${port}`));
  } catch (error) {
    logger.error("Fatal error during startup, shutting down:", error);
    process.exit(1);
  }
};

bootstrap();
