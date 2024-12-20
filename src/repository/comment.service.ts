import { db } from "@/firebaseConfig";
import {
  addDoc,
  collection,
  getDocs,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore";

const COLLECTION_NAME = "posts";

export const addCommentToPost = async (
postId: string, userId: string, username: string, photoURL: string, comment: string) => {
  try {
    const docRef = await addDoc(collection(db, `${COLLECTION_NAME}/${postId}/comments`), {
      userId,
      username,
      photoURL,
      comment,
      createdAt: Timestamp.now(),
    });
    console.log("Comment added with ID:", docRef.id);
  } catch (error) {
    console.error("Error adding comment:", error);
    throw error;
  }
};

export const getCommentsByPostId = async (postId: string) => {
  try {
    const q = query(
      collection(db, `${COLLECTION_NAME}/${postId}/comments`),
      orderBy("createdAt", "asc")
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as {
      id: string;
      username: string;
      photoURL: string;
      comment: string;
      createdAt: Timestamp;
    }[];
  } catch (error) {
    console.error("Error fetching comments:", error);
    return [];
  }
};
