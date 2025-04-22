import { CommonModule } from '@angular/common';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import Swal from 'sweetalert2';
import { LoginService } from '../login.service';
import { isPlatformBrowser } from '@angular/common';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule,RouterLink,RouterLinkActive,CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  loginTextMargin = '0%'; // Valeur initiale pour la marge gauche de "Login"
  signupTextMargin = '100%'; // Valeur initiale pour la marge gauche de "Signup"
  loginFormMargin = '0%'; // Valeur initiale pour la marge gauche du formulaire de login

  // Changer pour l'écran de connexion
  onLoginClick(): void {
    this.loginFormMargin = '0%'; // Réinitialiser la marge du formulaire
    this.loginTextMargin = '0%'; // Réinitialiser la marge du titre
    this.signupTextMargin = '100%'; // Déplacer le titre Signup hors de la vue
    this.router.navigate(['/home']);
  }

  // Changer pour l'écran d'inscription
  onSignupClick(): void {
    this.loginFormMargin = '-50%'; // Déplacer le formulaire à gauche
    this.loginTextMargin = '-50%'; // Déplacer le titre à gauche
    this.signupTextMargin = '0%'; // Réinitialiser la marge du titre Signup
  }

  // Changer de formulaire de connexion à inscription
  onSignupLinkClick(): void {
    this.onSignupClick(); // Simuler un clic sur le bouton "signup"
  }
  user1: any;
  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const user = localStorage.getItem('User');

      if (user) {
        console.log('User exists, redirecting...');
        this.user1 = JSON.parse(user); // Analyser l'objet JSON seulement si l'utilisateur existe
        this.router.navigate(['/Dashboard']); // Rediriger après avoir trouvé l'utilisateur
      } else {
        console.log('No user found.');
      }
    } else {
      console.warn('localStorage is not available in this environment');
      // Logique alternative si nécessaire (par exemple, rester sur la page de login)
    }
  }
  





  loginForm : FormGroup;
  signupForm: FormGroup;


  constructor(private fb: FormBuilder, private router: Router, private loginService: LoginService, private snackBar: MatSnackBar,@Inject(PLATFORM_ID) private platformId: Object) {
    this.loginForm = this.fb.group({
      email: ['', Validators.required],
      password: ['', Validators.required],
      role: ['ADMINISTRATEUR', Validators.required],
    });
    this.signupForm = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      telephone: ['', Validators.required],
      cni: ['', Validators.required],
      email: ['', Validators.required],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
      role: ['ADMINISTRATEUR', Validators.required],
    });
  }


  showNotification(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000, // Duration in milliseconds
      horizontalPosition: 'center', // Position horizontally
      verticalPosition: 'top', // Position vertically
    });
  }









  login() {
    const role = this.loginForm.get('role')?.value;

    if (role === 'ADMINISTRATEUR') {
      // Logique pour admin
      console.log('Admin login');
      // Ajoutez ici l'action spécifique à Admin (par exemple, redirection vers la page admin)
    } else if (role === 'RH') {
      // Logique pour receptionist
      console.log('RH login');
      // Ajoutez ici l'action spécifique à Receptionist (par exemple, redirection vers la page receptionist)
    }else if (role === 'Super_Admin') {
      // Logique pour receptionist
      console.log('Super_Admin login');
      // Ajoutez ici l'action spécifique à Receptionist (par exemple, redirection vers la page receptionist)
    }
  
    this.loginService.login(this.loginForm.value.email, this.loginForm.value.password, this.loginForm.value.role).subscribe({
      next: (tokens) => {
        this.loginService.getUser(this.loginForm.value.email).subscribe({
          next: (user) => {
            localStorage.clear();
            localStorage.setItem("User", JSON.stringify({
              id: user.id,
              nom: user.nom,
              prenom: user.prenom,
              email: user.email,
              telephone: user.telephone,
              cni: user.cni,
              role: user.role,
              tokens: {
                'Access_Token': tokens.Access_Token,
                'Refresh_Token': tokens.Refresh_Token
              }
            }));
  
            // Affichage d'un message de succès
            Swal.fire(
              'Succès!',
              'Vous êtes connecté avec succès!',
              'success'
            ).then(() => {
              this.router.navigate(['/Dashboard']);
              this.reloadPage("/Dashboard")
            });
          },
          error: (err) => {
            console.log(err);
          }
        });
      },
      error: (err) => {
        this.showNotification("Identifiants incorrects!");
        console.log(err);
  
        // Affichage d'un message d'erreur si les identifiants sont incorrects
        Swal.fire(
          'Erreur!',
          'Identifiants incorrects, veuillez réessayer.',
          'error'
        );
      }
    });
  }
  


  signup() {
    // Vérification des champs requis
    if (this.signupForm.value.nom === '' || this.signupForm.value.prenom === '' || this.signupForm.value.telephone === ''
      || this.signupForm.value.cni === '' || this.signupForm.value.email === '' || this.signupForm.value.password === '' || this.signupForm.value.role === '') {
      this.showNotification("Les champs obligatoires (*) sont requis!");
    }
    // Vérification si les mots de passe correspondent
    else if (this.signupForm.value.password !== this.signupForm.value.confirmPassword) {
      this.showNotification("Le mot de passe re-tapé est incorrect!");
    }
    else {
      // Appel au service signup pour créer un compte
      this.loginService.signup(this.signupForm.value.nom, this.signupForm.value.prenom, this.signupForm.value.email,
        this.signupForm.value.tel, this.signupForm.value.cni, this.signupForm.value.password, this.signupForm.value.role)
        .subscribe({
          next: (user) => {
            // Affichage du message de succès de création de compte
            Swal.fire(
              'Succès!',
              'Le compte a été créé avec succès!',
              'success'
            ).then(() => {
              // Connexion de l'utilisateur après la création du compte
              this.loginService.login(user.email, this.signupForm.value.password, this.signupForm.value.role).subscribe({
                next: (tokens) => {
                  this.loginService.getUser(user.email).subscribe({
                    next: (user) => {
                      // Sauvegarde des informations de l'utilisateur dans localStorage
                      localStorage.clear();
                      localStorage.setItem("User", JSON.stringify({
                        id: user.id,
                        nom: user.nom,
                        prenom: user.prenom,
                        email: user.email,
                        telephone: user.telephone,
                        adresse: user.adresse,
                        cni: user.cni,
                        role: user.role,
                        tokens: {
                          'Access_Token': tokens.Access_Token,
                          'Refresh_Token': tokens.Refresh_Token
                        }
                      }));
                      // Redirection vers la page Admin après la connexion
                      this.router.navigate(['/Dashboard']);
                    }
                  })
                },
                error: (err) => {
                  // Affichage d'un message d'erreur si les identifiants sont incorrects
                  Swal.fire(
                    'Erreur!',
                    'Identifiants incorrects!',
                    'error'
                  );
                  console.log(err);
                }
              })
            });
          },
          error: (err) => {
            // Affichage du message d'erreur si la création de compte échoue
            Swal.fire(
              'Erreur!',
              'Une erreur est survenue lors de la création du compte. Veuillez réessayer.',
              'error'
            );
            console.log(err);
          }
        })
    }
  }
  


  isLoginActive = true;

  switchToLogin() {
    this.isLoginActive = true;
  }

  switchToSignup() {
    this.isLoginActive = false;
  }

  passwordMatchValidator(form: FormGroup) {
    return form.get('password')?.value === form.get('confirmPassword')?.value 
      ? null : { mismatch: true };
  }




  reloadPage(route: string) {
    this.router.navigateByUrl(route).then(() => {
      window.location.reload();
    });
  }
}
