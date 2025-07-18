export type SeatStatus = {
  seatId: string;
  status: Status;
  startAt: string | null;
  duration: number;
  updatedAt: string;
};

export type Status = "IDLE" | "FOCUS" | "BREAK" | "STOP";
