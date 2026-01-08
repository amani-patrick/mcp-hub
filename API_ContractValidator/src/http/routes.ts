import { validateResponse } from "../tools/validate.js";
import { detectBreakingChanges } from "../tools/breaking.js";

export const routes = {
  "/validate": (req: any, res: any) => {
    const result = validateResponse(req.body.schema, req.body.response);
    res.json(result);
  },
  "/breaking": (req: any, res: any) => {
    const result = detectBreakingChanges(
      req.body.oldSpec,
      req.body.newSpec
    );
    res.json(result);
  }
};