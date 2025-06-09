/* eslint-disable @typescript-eslint/no-unsafe-return */
import { ResponseComposition, rest, RestContext, RestRequest } from "msw";

const handlers = [
  rest.post(
    "https://nom.telemetrydeck.com/v2/",
    async (req: RestRequest, res: ResponseComposition, ctx: RestContext) => {
      if (!req.body) {
        return res(
          ctx.delay(0),
          ctx.status(400),
          ctx.json({ message: "request body missing" }),
        );
      }
      return res(ctx.delay(0), ctx.json({ username: req.body }));
    },
  ),
];

export { handlers };
