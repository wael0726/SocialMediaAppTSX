import { useUserAuth } from "@/context/userAuthContext";
import { getAllUsers, getTweetsByUser, updateFollowing, updateFollowers } from "@/repository/user.service";
import { getPostByUserId } from "@/repository/post.service";
import { ProfileResponse, DocumentResponse, TweetResponse } from "@/types";
import avatar from "@/assets/images/avatar.png";
import { db } from "@/firebaseConfig"; // Firebase configuration
import {
  collection,
  addDoc,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import * as React from "react";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";

const UserList: React.FC = () => {
  const { user } = useUserAuth();
  const navigate = useNavigate();
  const [suggestedUser, setSuggestedUser] = React.useState<ProfileResponse[]>([]);
  const [selectedUser, setSelectedUser] = React.useState<ProfileResponse | null>(null);
  const [userPhotos, setUserPhotos] = React.useState<DocumentResponse[]>([]);
  const [userTweets, setUserTweets] = React.useState<TweetResponse[]>([]);
  const [selectedChatUser, setSelectedChatUser] = React.useState<ProfileResponse | null>(null);
  const [chatMessages, setChatMessages] = React.useState<
    { id: string; text: string; senderId: string; timestamp: Timestamp }[]
  >([]);
  const [newMessage, setNewMessage] = React.useState("");

  const getSuggestedUsers = async (userId: string) => {
    const response = (await getAllUsers(userId)) || [];
    setSuggestedUser(response);
  };

  const fetchUserDetails = async (userId: string) => {
    try {
      const postsSnapshot = await getPostByUserId(userId);
      const photos = postsSnapshot.docs.map((doc) => doc.data() as DocumentResponse);
      setUserPhotos(photos);

      const tweets = await getTweetsByUser(userId);
      setUserTweets(tweets);
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  React.useEffect(() => {
    if (user?.uid != null) {
      getSuggestedUsers(user.uid);
    }
  }, [user]);

  const handleUserClick = (user: ProfileResponse) => {
    setSelectedUser(user);
    if (user.userId) {
      fetchUserDetails(user.userId);
    }
  };

  const closePopup = () => {
    setSelectedUser(null);
    setUserPhotos([]);
    setUserTweets([]);
  };

  const handleFollow = async (followedUser: ProfileResponse) => {
    if (!user?.uid || !followedUser.userId || user.uid === followedUser.userId) {
      alert("Vous ne pouvez pas vous suivre vous-même.");
      return;
    }

    try {
      await updateFollowing(user.uid, followedUser.userId);
      await updateFollowers(followedUser.userId);
      alert(`Vous suivez maintenant ${followedUser.displayName || "cet utilisateur"}.`);
    } catch (error) {
      console.error("Erreur lors du suivi de l'utilisateur :", error);
      alert("Une erreur s'est produite. Veuillez réessayer.");
    }
  };

  const openChat = async (chatUser: ProfileResponse) => {
    setSelectedChatUser(chatUser);

    const chatId =
      user!.uid > chatUser.userId!
        ? `${user!.uid}_${chatUser.userId}`
        : `${chatUser.userId}_${user!.uid}`;

    const chatRef = collection(db, "chats", chatId, "messages");

    onSnapshot(chatRef, (snapshot) => {
      const messages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as { text: string; senderId: string; timestamp: Timestamp }),
      }));
      setChatMessages(messages.sort((a, b) => a.timestamp.toMillis() - b.timestamp.toMillis()));
    });
  };

  const closeChat = () => {
    setSelectedChatUser(null);
    setChatMessages([]);
    setNewMessage("");
  };

  const sendMessage = async () => {
    if (newMessage.trim() !== "" && selectedChatUser) {
      const chatId =
        user!.uid > selectedChatUser.userId!
          ? `${user!.uid}_${selectedChatUser.userId}`
          : `${selectedChatUser.userId}_${user!.uid}`;

      const chatRef = collection(db, "chats", chatId, "messages");

      await addDoc(chatRef, {
        text: newMessage,
        senderId: user!.uid,
        timestamp: Timestamp.now(),
      });

      setNewMessage("");
    }
  };

  const formatTimestamp = (timestamp: Timestamp) => {
    const date = timestamp.toDate();
    const options: Intl.DateTimeFormatOptions = { hour: "2-digit", minute: "2-digit" };
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], options)}`;
  };

  const renderUsers = () => {
    return suggestedUser.map((user) => (
      <div
        key={user.id}
        className="flex items-center gap-4 p-4 bg-black hover:bg-gray-800 rounded-lg transition shadow-md w-full"
      >
        <img
          src={user.photoURL ? user.photoURL : avatar}
          alt="User avatar"
          className="w-12 h-12 rounded-full border-2 border-gray-500 object-cover"
        />
        <div className="flex-1">
          <span className="font-semibold text-white block">{user.displayName || "Guest_User"}</span>
          <div className="flex gap-2 mt-2">
            <Button
              onClick={() => openChat(user)}
              className="text-sm bg-green-600 text-white px-2 py-1 rounded-md hover:bg-green-500 transition"
            >
              Chat
            </Button>
            <Button
              onClick={() => handleUserClick(user)}
              className="text-sm bg-blue-600 text-white px-2 py-1 rounded-md hover:bg-blue-500 transition"
            >
              Profile
            </Button>
          </div>
        </div>
      </div>
    ));
  };

  return (
    <div className="text-white py-8 px-4 bg-black min-h-screen">
      <div
        className="flex items-center gap-4 border-b border-gray-600 pb-4 mb-6 cursor-pointer"
        onClick={() => navigate("/profile")}
      >
        <img
          src={user?.photoURL ? user.photoURL : avatar}
          alt="Connected user avatar"
          className="w-12 h-12 rounded-full border-2 border-gray-500 object-cover"
        />
        <span className="font-semibold text-lg text-white">{user?.displayName || "Guest_user"}</span>
      </div>

      <h3 className="text-lg font-bold text-gray-300 mb-4">Suggested Friends</h3>
      <div className="overflow-y-auto max-h-[850px] scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
        {renderUsers()}
      </div>

      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-white text-gray-800 p-6 rounded-lg max-w-5xl w-full h-[90%] shadow-lg relative">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-3xl font-bold">{selectedUser.displayName || "Guest_User"}</h3>
              <Button variant="destructive" size="sm" onClick={closePopup}>
                Fermer
              </Button>
            </div>
            <div className="overflow-y-auto h-[80%] pr-4">
              <div className="flex flex-col items-center gap-6">
                <img
                  src={selectedUser.photoURL || avatar}
                  alt="Selected user avatar"
                  className="w-40 h-40 rounded-full border-4 border-gray-300 object-cover"
                />
                <p className="text-gray-700 text-center">{selectedUser.userBio || "Aucune biographie disponible."}</p>
                <div className="w-full">
                  <h4 className="text-lg font-bold mb-4">Photos</h4>
                  {userPhotos.length > 0 ? (
                    <div className="grid grid-cols-3 gap-4">
                      {userPhotos.map((photo, index) => (
                        <img
                          key={index}
                          src={photo.photos?.[0]?.cdnUrl || ""}
                          alt="User photo"
                          className="w-full h-40 object-cover rounded-md"
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500">Pas de photos disponibles.</p>
                  )}
                </div>
                <div className="w-full">
                  <h4 className="text-lg font-bold mb-4">Tweets</h4>
                  {userTweets.length > 0 ? (
                    <ul className="space-y-4">
                      {userTweets.map((tweet, index) => (
                        <li
                          key={index}
                          className="p-4 bg-gray-100 rounded-md shadow text-gray-800 text-base"
                        >
                          {tweet.content}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-center text-gray-500">Pas de tweets disponibles.</p>
                  )}
                </div>
              </div>
            </div>
            <div className="absolute bottom-4 left-0 w-full flex justify-center">
              <Button
                onClick={() => handleFollow(selectedUser)}
                className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-500 transition"
              >
                Follow
              </Button>
            </div>
          </div>
        </div>
      )}

      {selectedChatUser && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-white text-gray-800 p-6 rounded-lg max-w-3xl w-full h-[80%] shadow-lg flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Chat avec {selectedChatUser.displayName}</h3>
              <Button variant="destructive" size="sm" onClick={closeChat}>
                Fermer
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto bg-gray-100 p-4 rounded-md mb-4">
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start mb-4 ${
                    message.senderId === user!.uid ? "justify-end" : "justify-start"
                  }`}
                >
                  <img
                    src={message.senderId === user!.uid ? user!.photoURL || avatar : selectedChatUser!.photoURL || avatar}
                    alt="Sender avatar"
                    className="w-8 h-8 rounded-full mr-2 object-cover"
                  />
                  <div className="bg-gray-200 text-gray-900 px-4 py-2 rounded-md max-w-xs">
                    <p className="text-sm mb-1">{message.text}</p>
                    <span className="text-xs text-gray-500">{formatTimestamp(message.timestamp)}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex">
              <input
                type="text"
                className="flex-grow p-2 rounded-l-md bg-gray-800 text-white"
                placeholder="Tapez votre message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button
                onClick={sendMessage}
                className="bg-blue-600 px-4 py-2 rounded-r-md text-white hover:bg-blue-500"
              >
                Envoyer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserList;
