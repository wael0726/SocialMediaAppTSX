import { db } from "@/firebaseConfig";
import { ProfileResponse, UserProfile, Tweet, TweetResponse } from "@/types";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
  arrayUnion, 
  increment,
  Timestamp,
  orderBy,
  getDoc,
  deleteDoc
} from "firebase/firestore";

const COLLECTION_NAME = "users";
const TWEETS_COLLECTION = "tweets";

export const createUserProfile = (user: UserProfile) => {
  try {
    return addDoc(collection(db, COLLECTION_NAME), user);
  } catch (err) {
    console.log(err);
  }
};


export const updateLikesOnTweet = async (
  tweetId: string, 
  userlikes: string[], 
  likes: number
) => {
  try {
    const docRef = doc(db, TWEETS_COLLECTION, tweetId);
    return await updateDoc(docRef, {
      userlikes,
      likes
    });
  } catch (error) {
    console.error("Error updating tweet likes:", error);
    throw error;
  }
};

export const getUserProfile = async (userId: string) => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("userId", "==", userId)
    );
    const querySnapshot = await getDocs(q);
    let tempData: ProfileResponse = {};
    if (querySnapshot.size > 0) {
      querySnapshot.forEach((doc) => {
        const userData = doc.data() as UserProfile;
        tempData = {
          id: doc.id,
          ...userData,
        };
      });
      return tempData;
    } else {
      console.log("No such document");
      return null;
    }
  } catch (error) {
    console.log(error);
  }
};

export const updateUserProfile = async (id: string, user: UserProfile) => {
  const docRef = doc(db, COLLECTION_NAME, id);
  return updateDoc(docRef, {
    ...user,
  });
};

export const getAllUsers = async (userId: string) => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    const tempArr: ProfileResponse[] = [];
    if (querySnapshot.size > 0) {
      querySnapshot.forEach((doc) => {
        const userData = doc.data() as UserProfile;
        const responeObj: ProfileResponse = {
          id: doc.id,
          ...userData,
        };
        tempArr.push(responeObj);
      });
      return tempArr.filter((item) => item.userId != userId);
    } else {
      console.log("No such documents");
    }
  } catch (error) {
    console.log(error);
  }
};

// New tweet-related functions
export const createTweet = async (tweet: Tweet) => {
  try {
    // Add timestamp to the tweet
    const tweetWithTimestamp = {
      ...tweet,
      createdAt: Timestamp.now()
    };
    
    return await addDoc(collection(db, TWEETS_COLLECTION), tweetWithTimestamp);
  } catch (err) {
    console.error("Error creating tweet:", err);
    throw err;
  }
};

export const getTweetsByUser = async (userId: string) => {
  try {
    const q = query(
      collection(db, TWEETS_COLLECTION),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    const tweets: TweetResponse[] = [];
    
    querySnapshot.forEach((doc) => {
      const tweetData = doc.data() as Tweet;
      tweets.push({
        id: doc.id,
        ...tweetData
      });
    });
    
    return tweets;
  } catch (error) {
    console.error("Error fetching user tweets:", error);
    throw error;
  }
};

export const getAllTweets = async () => {
  try {
    const q = query(
      collection(db, TWEETS_COLLECTION),
      orderBy("createdAt", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    const tweets: TweetResponse[] = [];
    
    querySnapshot.forEach((doc) => {
      const tweetData = doc.data() as Tweet;
      tweets.push({
        id: doc.id,
        ...tweetData
      });
    });
    
    return tweets;
  } catch (error) {
    console.error("Error fetching all tweets:", error);
    throw error;
  }
};

export const updateTweet = async (tweetId: string, updates: Partial<Tweet>) => {
  try {
    const docRef = doc(db, TWEETS_COLLECTION, tweetId);
    return await updateDoc(docRef, updates);
  } catch (error) {
    console.error("Error updating tweet:", error);
    throw error;
  }
};

export const deleteTweet = async (tweetId: string) => {
  try {
    const docRef = doc(db, TWEETS_COLLECTION, tweetId);
    return await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting tweet:", error);
    throw error;
  }
};

export const deleteTweetById = async (tweetId: string) => {
  try {
    const tweetRef = doc(db, "tweets", tweetId);
    await deleteDoc(tweetRef);
    console.log(`Tweet ${tweetId} successfully deleted.`);
  } catch (error) {
    console.error(`Error deleting tweet ${tweetId}:`, error);
    throw error;
  }
};

export const updateFollowing = async (userId: string, followedUserId: string) => {
  const userDocRef = doc(db, "users", userId);

  try {
    const userDocSnapshot = await getDoc(userDocRef);
    if (!userDocSnapshot.exists()) {
      throw new Error(`L'utilisateur avec l'ID ${userId} n'existe pas.`);
    }

    await updateDoc(userDocRef, {
      following: arrayUnion(followedUserId), // Ajouter l'utilisateur suivi à la liste `following`
    });

    console.log(`${followedUserId} ajouté à la liste following de ${userId}.`);
  } catch (error) {
    console.error("Erreur lors de la mise à jour des following :", error);
    throw error;
  }
};

/**
 * Incrémenter le nombre de `followers` pour l'utilisateur suivi
 */
export const updateFollowers = async (followedUserId: string) => {
  const followedUserDocRef = doc(db, "users", followedUserId);

  try {
    const followedUserSnapshot = await getDoc(followedUserDocRef);
    if (!followedUserSnapshot.exists()) {
      throw new Error(`L'utilisateur avec l'ID ${followedUserId} n'existe pas.`);
    }

    await updateDoc(followedUserDocRef, {
      followers: increment(1), // Augmenter le nombre de followers
    });

    console.log(`Nombre de followers incrémenté pour ${followedUserId}.`);
  } catch (error) {
    console.error("Erreur lors de la mise à jour des followers :", error);
    throw error;
  }
};



