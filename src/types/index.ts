import { OutputFileEntry } from "@uploadcare/blocks";
import { User } from "firebase/auth";
import { Timestamp } from "firebase/firestore";

export interface Tweet {
  content: string;
  userId: string;
  username: string;
  photoURL?: string;
  createdAt?: Timestamp;
  likes?: number;
  userlikes: string[];
}

export interface TweetResponse extends Tweet {
  id: string;
  photoURL?: string;
}

// Interfaces pour l'authentification utilisateur
export interface UserLogIn {
  email: string;
  password: string;
}
export interface UserSignIn {
  email: string;
  password: string;
  confirmPassword: string;
}

// Interface pour la gestion des fichiers
export interface FileEntry {
  files: OutputFileEntry[];
}

// Interfaces pour les posts
export interface Post {
  caption: string;
  photos: PhotoMeta[];
  likes: number;
  userlikes: [];
  userId?: string;
  username?: string;
  photoURL?: string;
  date: Date;
}

export interface PhotoMeta {
  cdnUrl: string;
  uuid: string;
}

export interface DocumentResponse {
  id?: string;
  caption?: string;
  photos?: PhotoMeta[];
  likes?: number;
  userlikes?: [];
  username?: string;
  photoURL?: string;
  userId?: string;
  date?: Date;
}

// Interfaces pour les profils utilisateur
export interface ProfileInfo {
  user?: User;
  displayName?: string;
  photoURL?: string;
}

export interface UserProfile {
  userId?: string;
  displayName?: string;
  photoURL?: string;
  userBio?: string;
  followers?: number; 
  following?: number;
}

export interface ProfileResponse {
  id?: string;
  userId?: string;
  displayName?: string;
  photoURL?: string;
  userBio?: string;
  followers?: number; 
  following?: number;
}

export interface PhotoMeta {
  cdnUrl: string;
  uuid: string;
}


