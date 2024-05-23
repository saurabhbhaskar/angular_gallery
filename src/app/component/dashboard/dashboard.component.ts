import { Component, inject, effect, signal } from '@angular/core';
import { AuthService } from '../../service/auth.service';
import { GalleryService } from '../../service/gallery.service';
// import { signal } from 'some-signal-library';
import { v4 as uuid } from 'uuid';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  userId = signal('');
  errorMessageFile = signal('');
  errorMessagePhoto = signal('');
  imageData = signal([]);
  // urlCDN = signal('https://zoudgpsnuigulkmbbukn.supabase.co/storage/v1/object/public/photos/');
  urlCDN = signal('https://eegmfuapbmpnucjenscs.supabase.co/storage/v1/object/public/photos/');
  getModalImage = signal('');

  authService = inject(AuthService);
  galleryService = inject(GalleryService);

  constructor() {
    effect(() => {
      this.authService.currentUser.subscribe((user) => {
        this.userId.set(user?.id || '');
        console.log(this.userId());
      });
    }, { allowSignalWrites: true });
  }

  getSelectedPhoto() {
    this.galleryService.download('photos', this.userId() + '/')
      .then((data: any) => {
        console.log(data);
        this.imageData.set(data?.data || []);
      })
      .catch((error) => {
        console.error('Error downloading photos:', error);
      });
  }

  uploadPhoto(event: Event) {
    const input = event.target as HTMLInputElement;
    console.log(input.files);

    if (!input.files || input.files.length === 0) {
      this.errorMessageFile.set('Photos Does Not Exist');
      return;
    }

    const file: File = input.files[0];
    const id: string = uuid();

    this.galleryService.upload('photos', `${this.userId()}/${id}`, file).then((data) => {
      if (data.error) {
        this.errorMessagePhoto.set(`${data.error.message}, please upload a new photo`);
      } else {
        this.getSelectedPhoto();
      }
    }).catch((error) => {
      console.error('Error uploading photo:', error);
      this.errorMessagePhoto.set('An error occurred while uploading the photo. Please try again.');
    });
  }

  modalImage(image: string){
    this.getModalImage.set(image)
  }

}
