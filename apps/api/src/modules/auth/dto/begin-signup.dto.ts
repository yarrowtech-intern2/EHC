import { IsEmail, IsEnum, IsOptional, IsString } from "class-validator";

export enum ActorType {
  PATIENT = "patient",
  TENANT_ADMIN = "tenant_admin",
  FACILITY_OPERATOR = "facility_operator",
}

export enum SignupMethod {
  EMAIL_PASSWORD = "email_password",
  GOOGLE = "google",
  MAGIC_LINK = "magic_link",
  PHONE_OTP = "phone_otp",
}

export class BeginSignupDto {
  @IsEnum(ActorType)
  actorType!: ActorType;

  @IsEnum(SignupMethod)
  signupMethod!: SignupMethod;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  organizationName?: string;

  @IsOptional()
  @IsString()
  fullName?: string;
}
