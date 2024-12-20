import * as React from "react";
import { Heart, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserAuth } from "@/context/userAuthContext";
import { updateLikesOnPost } from "@/repository/post.service";
import CommentModal from "@/components/CommentModal";
import { formatDistance } from "date-fns";

interface PostCardProps {
  data: {
    id: string;
    photoURL: string;
    username: string;
    photos: { cdnUrl: string }[];
    likes: number;
    userlikes: string[];
    caption: string;
    date?: Date;
  };
}

const PostCard: React.FunctionComponent<PostCardProps> = ({ data }) => {
  const { user } = useUserAuth();
  const [likesInfo, setLikesInfo] = React.useState({
    likes: data.likes,
    isLike: data.userlikes.includes(user?.uid || ""),
  });

  const [isCommentModalOpen, setIsCommentModalOpen] = React.useState(false);

  const formattedDate = data.date
    ? formatDistance(new Date(data.date), new Date(), { addSuffix: true })
    : "Unknown date";

  const updateLike = async (isVal: boolean) => {
    setLikesInfo({
      likes: isVal ? likesInfo.likes + 1 : likesInfo.likes - 1,
      isLike: !likesInfo.isLike,
    });

    if (isVal) {
      data.userlikes.push(user?.uid || "");
    } else {
      data.userlikes.splice(data.userlikes.indexOf(user?.uid || ""), 1);
    }

    await updateLikesOnPost(
      data.id,
      data.userlikes,
      isVal ? likesInfo.likes + 1 : likesInfo.likes - 1
    );
  };

  return (
    <div className="border border-gray-300 rounded-lg shadow-md bg-white mb-6">
      <div className="p-4 flex items-center space-x-3">
        <img
          src={data.photoURL}
          alt="User avatar"
          className="w-10 h-10 rounded-full border border-gray-300 object-cover"
        />
        <div>
          <p className="font-semibold">{data.username}</p>
          <p className="text-gray-500 text-xs">{formattedDate}</p>
        </div>
      </div>
      <div className="flex justify-center bg-gray-100">
        <img
          src={data.photos[0]?.cdnUrl || ""}
          alt="Post"
          className="object-contain max-h-96"
        />
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <Heart
            className={cn(
              "cursor-pointer",
              likesInfo.isLike ? "fill-red-500" : "fill-none"
            )}
            onClick={() => updateLike(!likesInfo.isLike)}
          />
          <MessageCircle
            className="cursor-pointer"
            onClick={() => setIsCommentModalOpen(true)}
          />
        </div>
        <p className="mt-2 text-sm">{likesInfo.likes} likes</p>
        <p className="text-sm">
          <span className="font-semibold">{data.username}</span>: {data.caption}
        </p>
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

export default PostCard;
