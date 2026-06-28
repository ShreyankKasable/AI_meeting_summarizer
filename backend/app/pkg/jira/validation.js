import { BadRequest } from '#app/common/error/index.js';

export function validateJiraConfigure (req, res, next) {
  const { server_url: serverUrl, email, api_token: apiToken, project_key: projectKey } = req.body || {};
  if (!serverUrl || !email || !apiToken || !projectKey) {
    return next(new BadRequest('All fields are required'));
  }
  return next();
}
