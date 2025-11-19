import { initializeSystem } from "./core/initialize.core.js";
import { initApp } from "./core/initApp.core.js";

const bootstrap = async () => {
  await initializeSystem();
  const app = initApp();
  const port = process.env.PORT || 5000;
  app.listen(port, () => console.log(`🚀 Server running on ${port}`));
};

bootstrap();
