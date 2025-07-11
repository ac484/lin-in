// 本檔案依據 Firebase Console 專案設定，使用 Firebase Client SDK 操作 Authentication
// user$ 只會 emit null（未登入）或 User（已登入），不會有 undefined 狀態
import { Injectable, inject } from '@angular/core';
import { Auth, authState, signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, signOut, UserCredential, createUserWithEmailAndPassword, User } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { Firestore, doc, setDoc, serverTimestamp } from '@angular/fire/firestore';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  user$: Observable<User | null> = authState(this.auth);

  private async saveUserProfile(user: User) {
    if (!user || !user.uid) return;
    const userRef = doc(this.firestore, 'users', user.uid);
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
      lastLoginAt: serverTimestamp(),
      createdAt: user.metadata?.creationTime ? new Date(user.metadata.creationTime) : serverTimestamp(),
    }, { merge: true });
  }

  async loginWithGoogle(): Promise<UserCredential> {
    const cred = await signInWithPopup(this.auth, new GoogleAuthProvider());
    await this.saveUserProfile(cred.user);
    return cred;
  }

  async loginWithEmail(email: string, password: string): Promise<UserCredential> {
    const cred = await signInWithEmailAndPassword(this.auth, email, password);
    await this.saveUserProfile(cred.user);
    return cred;
  }

  async registerWithEmail(email: string, password: string): Promise<UserCredential> {
    const cred = await createUserWithEmailAndPassword(this.auth, email, password);
    await this.saveUserProfile(cred.user);
    return cred;
  }

  logout(): Promise<void> {
    return signOut(this.auth);
  }
} 