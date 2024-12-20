import Layout from "@/components/layout";
import PostCard from "@/components/postCard";
import TweetCard from "@/components/tweetCard";
import { Input } from "@/components/ui/input";
import { useUserAuth } from "@/context/userAuthContext";
import { getPosts } from "@/repository/post.service";
import { getAllTweets } from "@/repository/user.service";
import { DocumentResponse, TweetResponse } from "@/types";
import { Timestamp } from "firebase/firestore"; // Import pour gérer les Timestamps de Firebase
import { Search } from "lucide-react";
import * as React from "react";

interface FeedItem {
  id: string;
  type: "post" | "tweet";
  data: DocumentResponse | TweetResponse;
  createdAt: Date; // Toujours un objet Date pour éviter les erreurs
}

// Convertit un Timestamp ou une chaîne en objet Date valide
const toValidDate = (date: Timestamp | Date | string | undefined): Date => {
  if (date instanceof Timestamp) {
    return date.toDate();
  }
  if (typeof date === "string") {
    return new Date(date);
  }
  if (date instanceof Date) {
    return date;
  }
  return new Date(); // Retourne la date actuelle si aucune autre option valide
};

const Home: React.FunctionComponent = () => {
  const { user } = useUserAuth();
  const [feedData, setFeedData] = React.useState<FeedItem[]>([]);

  const getAllFeedItems = async () => {
    try {
      const posts: DocumentResponse[] = (await getPosts()) || [];
      const tweets: TweetResponse[] = (await getAllTweets()) || [];

      const combinedFeed: FeedItem[] = [
        ...posts.map((post) => ({
          id: post.id || `post-${Math.random().toString(36).substring(2, 9)}`,
          type: "post" as const,
          data: post,
          createdAt: toValidDate(post.date), // Convertit en Date valide
        })),
        ...tweets.map((tweet) => ({
          id: tweet.id || `tweet-${Math.random().toString(36).substring(2, 9)}`,
          type: "tweet" as const,
          data: tweet,
          createdAt: toValidDate(tweet.createdAt), // Convertit en Date valide
        })),
      ];

      setFeedData(
        combinedFeed.sort(
          (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
        )
      );
    } catch (error) {
      console.error("Error fetching feed items:", error);
    }
  };

  React.useEffect(() => {
    if (user) {
      getAllFeedItems();
    }
  }, [user]);

  const renderFeedItems = () => {
    return feedData.map((item) => {
      if (item.type === "post" && "photos" in item.data && "caption" in item.data) {
        const postData = {
          id: item.data.id!,
          photoURL: item.data.photoURL || "/default-avatar.png",
          username: item.data.username || "Anonymous",
          photos: item.data.photos || [],
          likes: item.data.likes || 0,
          userlikes: item.data.userlikes || [],
          caption: item.data.caption || "",
          date: item.createdAt, // Passe l'objet Date brut attendu par PostCard
        };

        return <PostCard data={postData} key={`post-${item.id}`} />;
      }

      if (item.type === "tweet") {
        return <TweetCard data={item.data as TweetResponse} key={`tweet-${item.id}`} />;
      }

      return null;
    });
  };

  return (
    <Layout>
      <div className="flex flex-col">
        <div className="relative mb-6 w-full text-gray-600">
          <Input
            className="border-2 border-gray-300 bg-white h-10 px-5 pr-16 rounded-sm text-base focus:outline-none"
            placeholder="search"
            type="search"
            name="search"
          />
          <button type="submit" className="absolute right-2.5 top-2.5">
            <Search className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        <div className="mb-5">
          <h4 className="mb-5 font-bold rounded-md">Your Feed</h4>
          <div className="w-full flex justify-center">
            <div className="flex flex-col max-w-sm rounded-sm overflow-hidden">
              {feedData.length > 0 ? renderFeedItems() : <div>...Loading</div>}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
