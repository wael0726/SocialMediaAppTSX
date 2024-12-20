import Layout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUserAuth } from "@/context/userAuthContext";
import { createTweet } from "@/repository/user.service";
import { Tweet } from "@/types";
import * as React from "react";
import { useNavigate } from "react-router-dom";

interface ICreateTweetProps {}

const CreateTweet: React.FunctionComponent<ICreateTweetProps> = () => {
  const navigate = useNavigate();
  const { user } = useUserAuth();
  const [tweet, setTweet] = React.useState<Tweet>({
    content: "",
    userId: "",
    username: "",
    photoURL: "", // Inclure la photoURL
    createdAt: undefined,
    likes: 0,
    userlikes: [],
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (user) {
      const newTweet: Tweet = {
        ...tweet,
        userId: user.uid,
        username: user.displayName || "Anonymous",
        photoURL: user.photoURL || "/default-avatar.png", // Ajouter la photo de profil
        likes: 0,
        userlikes: [],
        createdAt: undefined, // Firebase ajoutera l'horodatage
      };
      console.log("The new tweet is: ", newTweet);
      try {
        await createTweet(newTweet);
        navigate("/"); // Redirection vers la page d'accueil
      } catch (error) {
        console.error("Error creating tweet:", error);
      }
    } else {
      navigate("/login");
    }
  };

  return (
    <Layout>
      <div className="flex justify-center">
        <div className="border max-w-3xl w-full">
          <h3 className="bg-slate-800 text-white text-center text-lg p-2">
            Create Tweet
          </h3>
          <div className="p-8">
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col">
                <Label className="mb-4" htmlFor="tweetContent">
                  What's happening?
                </Label>
                <Textarea
                  className="mb-8"
                  id="tweetContent"
                  placeholder="Share your thoughts..."
                  value={tweet.content}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setTweet({ ...tweet, content: e.target.value })
                  }
                  maxLength={280}
                />
              </div>
              <Button className="mt-8 w-32" type="submit">
                Tweet
              </Button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CreateTweet;
