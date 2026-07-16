import { IsIn, IsString } from "class-validator";

export class UpdateAppointmentStatusDto {
  @IsString()
  appointmentId!: string;

  @IsIn(["confirmed", "checked_in", "completed", "cancelled"])
  status!: "confirmed" | "checked_in" | "completed" | "cancelled";
}

