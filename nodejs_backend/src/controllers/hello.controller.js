import logger from "../shared/utils/logger";

export const getHelloWorld = (req, res) => {
  const { username } = req.body;
  logger.info(`Login attempt for user: ${username}`);

  res.json({ message: `Welcome, ${username}` });
};
