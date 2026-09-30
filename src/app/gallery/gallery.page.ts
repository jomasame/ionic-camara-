import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonGrid, IonRow, IonCol, IonImg, IonFab,
  IonFabButton, IonIcon, IonCard, IonButton,
  IonItem, IonLabel, IonToggle, ToastController
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { camera, trashOutline, sparkles, flashOffOutline } from 'ionicons/icons';
import { PhotoService } from '../services/photo.service';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonGrid, IonRow, IonCol, IonImg, IonFab,
    IonFabButton, IonIcon, IonCard, IonButton,
    IonItem, IonLabel, IonToggle
  ],
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Bitácora de evidencias</ion-title>
      </ion-toolbar>

      <ion-toolbar color="light">
        <ion-item lines="none">
          <ion-icon
            [name]="isHighDef() ? 'sparkles' : 'flash-off-outline'"
            slot="start" color="primary"></ion-icon>
          <ion-label>
            <h3>{{ isHighDef() ? 'Modo alta definición (1080p)' : 'Modo ahorro de datos (800px)' }}</h3>
            <p>{{ isHighDef() ? 'Calidad 95% • Mayor detalle' : 'Calidad 60% • Carga rápida' }}</p>
          </ion-label>
          <ion-toggle
            [checked]="isHighDef()"
            (ionChange)="toggleQuality($event.detail.checked)"></ion-toggle>
        </ion-item>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-grid>
        <ion-row>
          @for (photo of photoService.photos(); track photo.filepath; let i = $index) {
            <ion-col size="12" size-md="6" size-lg="4">
              <ion-card>
                <ion-img [src]="photo.webPath" [alt]="photo.filepath"></ion-img>
                <div class="ion-padding">
                  <ion-button color="danger" fill="clear" expand="block"
                              (click)="photoService.deletePhoto(i)">
                    <ion-icon slot="start" name="trash-outline"></ion-icon>
                    Eliminar
                  </ion-button>
                </div>
              </ion-card>
            </ion-col>
          } @empty {
            <ion-col size="12" class="ion-text-center">
              <div style="margin-top: 60px; color: #64748b;">
                <ion-icon name="camera" style="font-size: 48px; margin-bottom: 12px;"></ion-icon>
                <p>No hay fotografías registradas.<br>Presione el botón inferior para comenzar.</p>
              </div>
            </ion-col>
          }
        </ion-row>
      </ion-grid>

      <ion-fab vertical="bottom" horizontal="center" slot="fixed">
        <ion-fab-button (click)="takePhoto()">
          <ion-icon name="camera"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  `
})
export class GalleryPage {
  public photoService = inject(PhotoService);
  private toastController = inject(ToastController);

  public isHighDef = signal<boolean>(false);

  constructor() {
    addIcons({ camera, trashOutline, sparkles, flashOffOutline });
  }

  toggleQuality(enabled: boolean): void {
    this.isHighDef.set(enabled);
  }

  async takePhoto(): Promise<void> {
    const result = await this.photoService.takeNewPhoto(this.isHighDef());
    if (!result.success && result.reason === 'permission_denied') {
      await this.showPermissionWarningToast();
    }
  }

  private async showPermissionWarningToast(): Promise<void> {
    const toast = await this.toastController.create({
      message: 'Permiso denegado. Conceda acceso a la cámara y galería en los ajustes del dispositivo.',
      duration: 3500,
      position: 'bottom',
      color: 'danger',
      buttons: [{ text: 'Entendido', role: 'cancel' }]
    });
    await toast.present();
  }
}