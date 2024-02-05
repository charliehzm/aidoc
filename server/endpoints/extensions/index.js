const { EventLogs } = require("../../models/eventLogs");
const { Telemetry } = require("../../models/telemetry");
const {
  forwardExtensionRequest,
} = require("../../utils/files/documentProcessor");
const {
  flexUserRoleValid,
  ROLES,
} = require("../../utils/middleware/multiUserProtected");
const { validatedRequest } = require("../../utils/middleware/validatedRequest");

function extensionEndpoints(app) {
  if (!app) return;

  app.post(
    "/ext/github/branches",
    [validatedRequest, flexUserRoleValid([ROLES.admin, ROLES.manager])],
    async (request, response) => {
      try {
        const responseFromProcessor = await forwardExtensionRequest({
          endpoint: "/ext/github-repo/branches",
          method: "POST",
          body: request.body,
        });
        response.status(200).json(responseFromProcessor);
      } catch (e) {
        console.error(e);
        response.sendStatus(500).end();
      }
    }
  );

  app.post(
    "/ext/github/repo",
    [validatedRequest, flexUserRoleValid([ROLES.admin, ROLES.manager])],
    async (request, response) => {
      try {
        const responseFromProcessor = await forwardExtensionRequest({
          endpoint: "/ext/github-repo",
          method: "POST",
          body: request.body,
        });
        await Telemetry.sendTelemetry("extension_invoked", {
          type: "github_repo",
        });
        await EventLogs.logEvent(
          "extension_invoked",
          {
            type: "github_repo",
          },
          response.locals?.user?.id
        );
        response.status(200).json(responseFromProcessor);
      } catch (e) {
        console.error(e);
        response.sendStatus(500).end();
      }
    }
  );

  app.post(
    "/ext/youtube/transcript",
    [validatedRequest, flexUserRoleValid([ROLES.admin, ROLES.manager])],
    async (request, response) => {
      try {
        const responseFromProcessor = await forwardExtensionRequest({
          endpoint: "/ext/youtube-transcript",
          method: "POST",
          body: request.body,
        });
        await Telemetry.sendTelemetry("extension_invoked", {
          type: "youtube_transcript",
        });
        await EventLogs.logEvent(
          "extension_invoked",
          {
            type: "youtube_transcript",
          },
          response.locals?.user?.id
        );
        response.status(200).json(responseFromProcessor);
      } catch (e) {
        console.error(e);
        response.sendStatus(500).end();
      }
    }
  );
}

module.exports = { extensionEndpoints };
