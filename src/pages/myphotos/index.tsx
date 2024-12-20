import Layout from "@/components/layout";
import { useUserAuth } from "@/context/userAuthContext";
import { getPostByUserId, deletePostById } from "@/repository/post.service"; // Ajout de la méthode deletePostById
import { getTweetsByUser, deleteTweetById } from "@/repository/user.service"; // Ajout de la méthode deleteTweetById
import { DocumentResponse, TweetResponse, Post } from "@/types";
import { HeartIcon, Trash, Twitter } from "lucide-react"; // Import de l'icône de suppression
import * as React from "react";

interface FeedItem {
  type: "photo" | "tweet";
  data: DocumentResponse | TweetResponse;
  createdAt: Date;
}

const MyPhotos: React.FunctionComponent = () => {
  const { user } = useUserAuth();
  const [feedData, setFeedData] = React.useState<FeedItem[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);

  const getAllUserContent = async (userId: string) => {
    try {
      setIsLoading(true);

      // Fetch posts
      const postsSnapshot = await getPostByUserId(userId);
      const postItems: FeedItem[] = postsSnapshot.size > 0
        ? postsSnapshot.docs.map((doc) => {
            const data = doc.data() as Post;
            return {
              type: "photo",
              data: {
                id: doc.id,
                ...data,
              },
              createdAt: new Date(data.date),
            };
          })
        : [];

      // Fetch tweets
      const tweets = await getTweetsByUser(userId);
      const tweetItems: FeedItem[] = tweets.map((tweet) => ({
        type: "tweet",
        data: tweet,
        createdAt: tweet.createdAt ? tweet.createdAt.toDate() : new Date(),
      }));

      // Combine and sort feed items
      const combinedFeed = [...postItems, ...tweetItems].sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
      );

      setFeedData(combinedFeed);
    } catch (error) {
      console.error("Error fetching user content:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await deletePostById(postId); // Suppression dans Firestore
      setFeedData(feedData.filter((item) => item.type !== "photo" || item.data.id !== postId)); // Mise à jour locale
      console.log(`Post with ID: ${postId} deleted successfully.`);
    } catch (error) {
      console.error(`Failed to delete post with ID: ${postId}`, error);
    }
  };

  const handleDeleteTweet = async (tweetId: string) => {
    try {
      await deleteTweetById(tweetId); // Suppression dans Firestore
      setFeedData(feedData.filter((item) => item.type !== "tweet" || item.data.id !== tweetId)); // Mise à jour locale
      console.log(`Tweet with ID: ${tweetId} deleted successfully.`);
    } catch (error) {
      console.error(`Failed to delete tweet with ID: ${tweetId}`, error);
    }
  };

  React.useEffect(() => {
    if (user != null) {
      getAllUserContent(user.uid);
    }
  }, [user]);

  const renderFeedItem = (item: FeedItem) => {
    if (item.type === "photo") {
      const photoItem = item.data as DocumentResponse;

      if (!photoItem.photos || photoItem.photos.length === 0) {
        return null; // Skip invalid photo entries
      }

      return (
        <div key={photoItem.id} className="relative">
          <div className="absolute group transition-all duration-200 bg-transparent hover:bg-slate-950 hover:bg-opacity-75 top-0 bottom-0 left-0 right-0 w-full h-full">
            <div className="flex flex-col justify-center items-center w-full h-full">
              <HeartIcon className="hidden group-hover:block fill-white" />
              <div className="hidden group-hover:block text-white">
                {photoItem.likes} likes
              </div>
            </div>
          </div>
          <img
            src={`${photoItem.photos[0].cdnUrl}/-/progressive/yes/-/scale_crop/300x300/center/`}
            alt="User post"
            className="w-full h-full object-cover"
          />
          <button
            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
            onClick={() => handleDeletePost(photoItem.id!)}
          >
            <Trash className="w-4 h-4" />
          </button>
        </div>
      );
    }

    if (item.type === "tweet") {
      const tweet = item.data as TweetResponse;

      return (
        <div
          key={tweet.id}
          className="relative bg-white border p-4 flex flex-col justify-between shadow-sm rounded-lg"
        >
          <div className="flex items-center mb-2">
            <Twitter className="mr-2 text-blue-400" />
            <span className="font-semibold">{tweet.username}</span>
          </div>
          <p className="text-gray-800 mb-2">{tweet.content}</p>
          <div className="flex justify-between items-center">
            <div className="flex items-center text-gray-500">
              <HeartIcon className="mr-2" size={16} />
              <span>{tweet.likes || 0} likes</span>
            </div>
            <button
              className="bg-red-500 text-white p-1 rounded-full"
              onClick={() => handleDeleteTweet(tweet.id)}
            >
              <Trash className="w-4 h-4" />
            </button>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <Layout>
      <div className="flex justify-center">
        <div className="border max-w-3xl w-full">
          <h3 className="bg-slate-800 text-white text-center text-lg p-2">
            My Content
          </h3>
          <div className="p-8">
            {isLoading ? (
              <div className="text-center text-gray-500">Loading...</div>
            ) : feedData.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {feedData.map(renderFeedItem)}
              </div>
            ) : (
              <div className="text-center text-gray-500">
                No content available.
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MyPhotos;
