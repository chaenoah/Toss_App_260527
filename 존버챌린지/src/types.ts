export type Challenge = {
  id: string;
  ticker: string;
  name: string;
  startedAt: number;
  createdAt: number;
};

export type EndedChallenge = Challenge & {
  endedAt: number;
  reason: "sold" | "deleted";
};
