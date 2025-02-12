import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, ChangeDetectorRef, Output, EventEmitter, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { SettingsService } from '../Settings.Service';
import { environment } from '../../../../../../environments/environment';
import { NgFor, NgIf, TitleCasePipe } from '@angular/common';
import { Router } from '@angular/router';
import { ScrollingModule } from '@angular/cdk/scrolling';

@Component({
  selector: 'edit-account',
  templateUrl: './edit-account.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  //changeDetection: ChangeDetectionStrategy.Default,
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatButtonModule,
    CommonModule,
  ],
})
export class EditAccountComponent implements OnInit {
  @Output() panelChanged = new EventEmitter<string>();
  @Output() accountUpdated = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();
  @Input() userId: string;
  editAccountForm: FormGroup;
  passwordForm: FormGroup;
  showPasswordSection: boolean = false;
  imagePreview: string | null = null;
  imageName: string | null = null;
  message: string | null = null;

  constructor(
    private _formBuilder: FormBuilder,
    private cdr: ChangeDetectorRef,
    private _httpClient: HttpClient,
    private settingsService: SettingsService
  ) {}

  ngOnInit(): void {
    console.log('ID de usuario recibido:', this.userId);
    this.checkSessionStorage();
    this.initializeForms();
    
    // Obtener el ID del usuario del sessionStorage si no se proporcionó como Input
    const storedUserId = sessionStorage.getItem('selectedUserId');
    if (storedUserId && !this.userId) {
      this.userId = storedUserId;
      console.log('ID de usuario desde sessionStorage:', this.userId);
    }

    if (this.userId) {
      this.loadUserData();
    } else {
      console.error('No se encontró ID de usuario');
      this.message = 'No se pudo cargar la información del usuario';
    }
  }

  initializeForms(): void {
    this.editAccountForm = this._formBuilder.group({
      name: ['', Validators.required],
      lastname: ['', Validators.required],
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      email: ['', [Validators.required, Validators.email]],
      photo: [null],
      roles: ['', Validators.required],
      status: ['', Validators.required],
    });

    this.passwordForm = this._formBuilder.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }

  loadUserData(): void {
    console.log('Cargando datos del usuario con ID:', this.userId);
    
    this._httpClient.get(`${environment.baseUrl}/user/${this.userId}`).subscribe(
      (response: any) => {
        console.log('Respuesta del servidor:', response);
        
        if (response.data) {
          const userData = response.data;
          console.log('Datos del usuario obtenidos:', userData);

          // Actualizar el formulario con los datos
          this.editAccountForm.patchValue({
            name: userData.nombres,
            lastname: userData.apellidos,
            username: userData.usuario,
            email: userData.email,
            roles: userData.role,
            status: userData.estado.toString()
          });

          // Manejar la imagen del perfil
          if (userData.image) {
            this.imagePreview = `${environment.baseUrl}${userData.image}`;
            this.imageName = userData.image.split('/').pop();
          }

          this.cdr.detectChanges();
          console.log('Formulario actualizado:', this.editAccountForm.value);
        } else {
          console.error('No se recibieron datos válidos del usuario');
          this.message = 'No se pudieron cargar los datos del usuario';
        }
      },
      error => {
        console.error('Error al cargar datos del usuario:', error);
        this.message = 'Error al cargar los datos del usuario';
      }
    );
  }
  
  
  
  // Cambiar al panel del equipo
  goToTeam(): void {
    this.panelChanged.emit('team');
  }
  

  // Maneja la selección de archivos
  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
        this.imageName = file.name;
        console.log('Imagen cargada:', this.imagePreview);  // Verifica la URL generada
        console.log('Nombre de la imagen:', this.imageName);  // Verifica el nombre
        this.cdr.detectChanges(); // Forzar la actualización de la vista
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.editAccountForm.valid && this.userId) {
      console.log('Enviando formulario con datos:', this.editAccountForm.value);
      
      const formData = new FormData();
      
      // Agregar todos los campos del formulario al FormData
      Object.keys(this.editAccountForm.controls).forEach(key => {
        if (key !== 'photo') {
          formData.append(key, this.editAccountForm.get(key).value);
        }
      });

      // Agregar la imagen si existe
      const fileInput = document.querySelector('#photo') as HTMLInputElement;
      if (fileInput?.files?.length > 0) {
        formData.append('image', fileInput.files[0]);
      }

      this._httpClient.put(`${environment.baseUrl}/user/${this.userId}`, formData)
        .subscribe(
          response => {
            console.log('Usuario actualizado exitosamente:', response);
            this.accountUpdated.emit();
          },
          error => {
            console.error('Error al actualizar usuario:', error);
            this.message = 'Error al actualizar el usuario';
          }
        );
    } else {
      console.log('Formulario inválido o ID de usuario no disponible');
    }
  }

  checkSessionStorage(): void {
    // Verificar si el dato clave está en sessionStorage
    const userId = sessionStorage.getItem('selectedUserId'); // Cambia 'userId' por la clave que estés verificando

    if (!userId) {
      // Si el dato no existe, redirigir al usuario
      console.log('No se encontró el dato en sessionStorage. Redirigiendo...');
      this.message = 'Debe seleccionar un usuario antes de editar.';
      this.panelChanged.emit('team');
    }
  }
  
  // Validador personalizado para confirmar contraseña
  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword').value === g.get('confirmPassword').value
      ? null : {'mismatch': true};
  }

  togglePasswordSection(): void {
    this.showPasswordSection = !this.showPasswordSection;
  }

  // Actualizar el método changePassword para implementar la funcionalidad
  changePassword(): void {
    if (this.passwordForm.valid && this.userId) {
      const passwordData = {
        currentPassword: this.passwordForm.get('currentPassword').value,
        newPassword: this.passwordForm.get('newPassword').value
      };

      this._httpClient.post(`${environment.baseUrl}/user/${this.userId}/change-password`, passwordData)
        .subscribe(
          (response) => {
            console.log('Contraseña actualizada con éxito');
            this.passwordForm.reset();
            this.showPasswordSection = false;
          },
          (error) => {
            console.error('Error al actualizar la contraseña:', error);
          }
        );
    }
  }

  saveChanges(): void {
    if (this.editAccountForm.valid) {
      this.onSubmit();
    }
  }
}
