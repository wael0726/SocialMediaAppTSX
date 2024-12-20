import FileUploader from "@/components/fileUploader";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileEntry, ProfileInfo, UserProfile } from "@/types";
import avatar from "@/assets/images/avatar.png";
import { Label } from "@radix-ui/react-label";
import * as React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import Layout from "@/components/layout";
import {
  createUserProfile,
  updateUserProfile,
} from "@/repository/user.service";
import { useUserAuth } from "@/context/userAuthContext";
import { updateUserInfoOnPosts } from "@/repository/post.service";
import Groq from "groq-sdk";
import { lamaKey } from "@/chatgpt";

interface IEditProfileProps {}

const EditProfile: React.FunctionComponent<IEditProfileProps> = () => {
  const { user, updateProfileInfo } = useUserAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { id, userId, userBio, displayName, photoURL } = location.state;

  const [data, setData] = React.useState<UserProfile>({
    userId,
    userBio,
    displayName,
    photoURL,
  });

  const [fileEntry, setFileEntry] = React.useState<FileEntry>({
    files: [],
  });

  const [isLoadingAI, setIsLoadingAI] = React.useState(false); // Loading state for AI rewriting
  const groq = new Groq({ apiKey: lamaKey, dangerouslyAllowBrowser: true });

  const rewriteBio = async (bio: string) => {
    setIsLoadingAI(true);
    try {
      const completion = await groq.chat.completions.create({
        model: "llama3-8b-8192",
        messages: [
          {
            role: "system",
            content:
              "Réécris cette biographie utilisateur en français, en gardant un ton professionnel mais accueillant. Cette biographie ne doit pas depasser 50 mots et dois etre faites pour un utilisateur de reseau social. Par exemple, si un utilisateur te donne pour mots clés : technologie, musique, cinéma. Toi tu devra retourner quelque chose comme ceci : Passionné par la tech et le cinéma, toujours prêt à explorer de nouvelles mélodies !. Autre chose, tu ne dois pas mettre de guillemet dans ta description et de référence trop précise.",
          },
          { role: "user", content: bio },
        ],
      });

      const newBio = completion?.choices[0]?.message?.content?.trim();
      if (newBio) {
        setData({ ...data, userBio: newBio });
      } else {
        console.warn("Aucune réponse valide de l'IA. Bio inchangée.");
      }
    } catch (error) {
      console.error("Erreur lors de la réécriture de la bio :", error);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const updateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (id) {
        const response = await updateUserProfile(id, data);
        console.log("Profil mis à jour :", response);
      } else {
        const response = await createUserProfile(data);
        console.log("Profil créé :", response);
      }

      const profileInfo: ProfileInfo = {
        user: user!,
        displayName: data.displayName,
        photoURL: data.photoURL,
      };

      updateProfileInfo(profileInfo);
      updateUserInfoOnPosts(profileInfo);

      navigate("/profile");
    } catch (err) {
      console.error("Erreur lors de la mise à jour du profil :", err);
    }
  };

  React.useEffect(() => {
    if (fileEntry.files.length > 0) {
      setData({ ...data, photoURL: fileEntry.files[0].cdnUrl || "" });
    }
  }, [fileEntry]);

  return (
    <Layout>
      <div className="flex justify-center">
        <div className="border max-w-3xl w-full">
          <h3 className="bg-slate-800 text-white text-center text-lg p-2">
            Modifier le Profil
          </h3>
          <div className="p-8">
            <form onSubmit={updateProfile}>
              <div className="flex flex-col">
                <Label className="mb-4" htmlFor="photo">
                  Photo de Profil
                </Label>
                <div className="mb-4">
                  {fileEntry.files.length > 0 ? (
                    <img
                      src={fileEntry.files[0].cdnUrl!}
                      alt="avatar"
                      className="w-28 h-28 rounded-full border-2 border-slate-800 object-cover"
                    />
                  ) : (
                    <img
                      src={data.photoURL ? data.photoURL : avatar}
                      alt="avatar"
                      className="w-28 h-28 rounded-full border-2 border-slate-800 object-cover"
                    />
                  )}
                </div>
                <FileUploader
                  fileEntry={fileEntry}
                  onChange={setFileEntry}
                  preview={false}
                />
              </div>
              <div className="flex flex-col">
                <Label className="mb-4" htmlFor="displayName">
                  Nom d'Utilisateur
                </Label>
                <Input
                  className="mb-8"
                  id="displayName"
                  placeholder="Entrez votre nom d'utilisateur"
                  value={data.displayName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setData({ ...data, displayName: e.target.value })
                  }
                />
              </div>
              <div className="flex flex-col">
                <Label className="mb-4" htmlFor="userBio">
                  Biographie
                </Label>
                <Textarea
                  className="mb-8"
                  id="userBio"
                  placeholder="Que pensez-vous ?"
                  value={data.userBio}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setData({ ...data, userBio: e.target.value })
                  }
                />
                <Button
                  className="mb-4"
                  variant="outline"
                  onClick={() => rewriteBio(data.userBio || "")}
                  disabled={isLoadingAI}
                >
                  {isLoadingAI ? "Réécriture en cours..." : "Réécrire avec l'IA"}
                </Button>
              </div>
              <Button className="mt-4 w-32 mr-8" type="submit">
                Mettre à jour
              </Button>
              <Button
                variant="destructive"
                className="mt-4 w-32 mr-8"
                onClick={() => navigate("/profile")}
              >
                Annuler
              </Button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EditProfile;

