export interface UserPhoto {
  filepath: string;
  webPath?: string;
  format: string;
}

export type CaptureFailureReason = 'permission_denied' | 'cancelled' | 'error';

export interface CaptureResult {
  success: boolean;
  reason?: CaptureFailureReason;
}