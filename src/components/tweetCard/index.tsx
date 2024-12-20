import * as React from "react";
import { TweetResponse } from "@/types";
import { formatDistance } from "date-fns";
import { MoreHorizontal, Heart, MessageCircle } from "lucide-react";
import { useUserAuth } from "@/context/userAuthContext";
import { updateLikesOnTweet } from "@/repository/user.service";
import { cn } from "@/lib/utils";
import CommentModal from "@/components/CommentModal";

interface TweetCardProps {
  data: TweetResponse;
}

const TweetCard: React.FunctionComponent<TweetCardProps> = ({ data }) => {
  const { user } = useUserAuth();
  const [isCommentModalOpen, setIsCommentModalOpen] = React.useState(false);
  const [likesInfo, setLikesInfo] = React.useState({
    likes: data.likes || 0,
    isLike: data.userlikes?.includes(user?.uid || "") || false,
  });

  const formattedDate = data.createdAt
    ? formatDistance(data.createdAt.toDate(), new Date(), { addSuffix: true })
    : "";

  const updateLike = async (isVal: boolean) => {
    setLikesInfo({
      likes: isVal ? likesInfo.likes + 1 : likesInfo.likes - 1,
      isLike: !likesInfo.isLike,
    });

    const updatedUserLikes = [...(data.userlikes || [])];
    if (isVal) {
      updatedUserLikes.push(user?.uid || "");
    } else {
      const index = updatedUserLikes.indexOf(user?.uid || "");
      if (index > -1) {
        updatedUserLikes.splice(index, 1);
      }
    }

    await updateLikesOnTweet(
      data.id,
      updatedUserLikes,
      isVal ? likesInfo.likes + 1 : likesInfo.likes - 1
    );
  };

  return (
    <div className="border border-gray-300 rounded-lg shadow-md py-4 px-4 bg-white hover:shadow-lg transition-shadow mb-6">
      <div className="flex justify-between items-start">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden">
            {data.photoURL ? (
              <img
                src={data.photoURL}
                alt={data.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                {data.username ? data.username[0].toUpperCase() : "U"}
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold">{data.username || "Anonymous"}</span>
              <span className="text-gray-500 text-sm">{formattedDate}</span>
            </div>
            <p className="text-gray-800 mt-1">{data.content}</p>
          </div>
        </div>
        <button className="text-gray-500 hover:text-gray-700">
          <MoreHorizontal size={20} />
        </button>
      </div>
      <div className="flex justify-between items-center mt-3 text-gray-500">
        <button
          className="flex items-center space-x-2 hover:text-red-500"
          onClick={() => updateLike(!likesInfo.isLike)}
        >
          <Heart
            size={16}
            className={cn(
              "cursor-pointer",
              likesInfo.isLike ? "fill-red-500" : "fill-none"
            )}
          />
          <span>{likesInfo.likes}</span>
        </button>
        <button
          className="flex items-center space-x-2 hover:text-blue-500"
          onClick={() => setIsCommentModalOpen(true)}
        >
          <MessageCircle size={16} />
          <span>Comments</span>
        </button>
      </div>
      {isCommentModalOpen && (
        <CommentModal
          postId={data.id}
          onClose={() => setIsCommentModalOpen(false)}
        />
      )}
    </div>
  );
};

export default TweetCard;
