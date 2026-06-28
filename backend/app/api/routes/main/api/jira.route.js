import express from 'express';
import { expressAsyncHandler } from '#app/api/middlewares/asyncHandler.js';
import { BadRequest } from '#app/common/error/index.js';
import { jiraService } from '#app/pkg/jira/service.js';
import { validateJiraConfigure } from '#app/pkg/jira/validation.js';

const router = express.Router();

// POST /api/jira/configure
router.post('/configure', validateJiraConfigure, expressAsyncHandler(async (req, res) => {
  const { server_url: serverUrl, email, api_token: apiToken, project_key: projectKey } = req.body;
  try {
    await jiraService.configure(serverUrl, email, apiToken, projectKey);
  } catch (e) {
    throw new BadRequest(`Jira connection test failed: ${e.message}`);
  }
  res.json({ success: true, message: 'Jira configured successfully' });
}));

// GET /api/jira/status
router.get('/status', (req, res) => {
  res.json({ connected: jiraService.isAuthenticated() });
});

export default router;
