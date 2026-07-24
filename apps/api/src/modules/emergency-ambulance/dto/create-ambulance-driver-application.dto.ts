import { IsEmail, IsOptional, IsString, MaxLength, MinLength, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

class DriverDocumentImagesDto {
  @IsString()
  @MinLength(12)
  driverLicenseImage!: string;

  @IsString()
  @MinLength(12)
  vehicleRegistrationImage!: string;

  @IsString()
  @MinLength(12)
  ambulancePermitImage!: string;

  @IsString()
  @MinLength(12)
  driverPhotoImage!: string;
}

export class CreateAmbulanceDriverApplicationDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  fullName!: string;

  @IsString()
  @MinLength(7)
  @MaxLength(32)
  phone!: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsString()
  @MinLength(2)
  @MaxLength(160)
  serviceName!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(80)
  city!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(32)
  vehicleNumber!: string;

  @IsString()
  @MinLength(4)
  @MaxLength(64)
  licenseNumber!: string;

  @IsString()
  @MinLength(4)
  @MaxLength(64)
  ambulancePermitNumber!: string;

  @ValidateNested()
  @Type(() => DriverDocumentImagesDto)
  documents!: DriverDocumentImagesDto;
}
