import { Injectable, signal } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { CaptureResult, UserPhoto } from '../models/photo.model';

@Injectable({ providedIn: 'root' })
export class PhotoService {
  private photosSignal = signal<UserPhoto[]>([]);
  public readonly photos = this.photosSignal.asReadonly();

  async takeNewPhoto(isHighDef: boolean): Promise<CaptureResult> {
    try {
      if (Capacitor.isNativePlatform()) {
        const granted = await this.ensurePermissions();
        if (!granted) {
          return { success: false, reason: 'permission_denied' };
        }
      }

      const imageQuality = isHighDef ? 95 : 60;
      const targetWidth = isHighDef ? 1920 : 800;

      const captured: Photo = await Camera.getPhoto({
        resultType: CameraResultType.Uri,
        source: CameraSource.Prompt,
        quality: imageQuality,
        width: targetWidth,
        allowEditing: false,
        promptLabelHeader: 'Seleccionar origen',
        promptLabelPhoto: 'Elegir de la galería',
        promptLabelPicture: 'Tomar fotografía',
        promptLabelCancel: 'Cancelar'
      });

      const newPhoto: UserPhoto = {
        filepath: `${Date.now()}.${captured.format}`,
        webPath: captured.webPath,
        format: captured.format
      };

      this.photosSignal.update(photos => [newPhoto, ...photos]);
      return { success: true };
    } catch (error: any) {
      const msg: string = error?.message ?? '';
      if (msg.includes('cancelled') || msg.includes('User cancelled')) {
        return { success: false, reason: 'cancelled' };
      }
      console.error('Error durante la captura:', error);
      return { success: false, reason: 'error' };
    }
  }

  deletePhoto(index: number): void {
    this.photosSignal.update(photos => photos.filter((_, i) => i !== index));
  }

  private async ensurePermissions(): Promise<boolean> {
    const ok = (s: string) => s === 'granted' || s === 'limited';

    const status = await Camera.checkPermissions();
    if (ok(status.camera) && ok(status.photos)) {
      return true;
    }

    const request = await Camera.requestPermissions({ permissions: ['camera', 'photos'] });
    return ok(request.camera) || ok(request.photos);
  }
}