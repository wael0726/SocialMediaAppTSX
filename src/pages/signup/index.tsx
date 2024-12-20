import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Icons } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { useUserAuth } from "@/context/userAuthContext";
import { UserSignIn } from "@/types";
import { Label } from "@radix-ui/react-label";
import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import "@dotlottie/player-component";
import yng from "@/assets/images/yng3.jpg"; 

const initialValue: UserSignIn = {
  email: "",
  password: "",
  confirmPassword: "",
};

const Signup: React.FunctionComponent = () => {
  const { googleSignIn, facebookSignIn, signUp } = useUserAuth();
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = React.useState<UserSignIn>(initialValue);

  const handleGoogleSignIn = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    try {
      await googleSignIn();
      navigate("/");
    } catch (error) {
      console.log("Error : ", error);
    }
  };

  const handleFacebookSignIn = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    try {
      await facebookSignIn();
      navigate("/");
    } catch (error) {
      console.error("Facebook Sign-in Error:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (userInfo.password !== userInfo.confirmPassword) {
      console.error("Passwords do not match!");
      return;
    }
    try {
      await signUp(userInfo.email, userInfo.password);
      navigate("/");
    } catch (error) {
      console.log("Error : ", error);
    }
  };

  return (
    <div className="w-full h-screen flex">
      {/* Section gauche avec l'image */}
      <div className="w-1/2 relative">
        <img
          src={yng} // Utilisation de l'image importée
          alt="Signup Background"
          className="w-full h-full object-cover"
        />
        {/* Bande horizontale transparente */}
        <div className="absolute bottom-0 w-full h-1/4 bg-black bg-opacity-50 flex flex-col items-center justify-center">
          <h1 className="text-4xl font-bold text-white">Join MyCircle Today!</h1>
          <p className="text-lg text-gray-300 mt-2 font-semibold">
          Create your account to start sharing
          </p>
        </div>
      </div>

      {/* Section droite */}
      <div className="w-1/2 bg-gray-100 flex items-center justify-center">
        <div className="max-w-sm rounded-xl border bg-card text-card-foreground shadow-sm">
          <Card>
            <form onSubmit={handleSubmit}>
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl text-center mb-4">
                  MyCircle
                </CardTitle>
                <CardDescription>
                  Enter your details to create your account
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <Button variant="outline" onClick={handleGoogleSignIn}>
                  <Icons.google className="mr-2 h-4 w-4" />
                  Google
                </Button>
                <Button
                  variant="outline"
                  onClick={handleFacebookSignIn}
                  className="text-black"
                >
                  <Icons.facebook className="mr-2 h-4 w-4" />
                  Facebook
                </Button>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or
                    </span>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@example.com"
                    value={userInfo.email}
                    onChange={(e) =>
                      setUserInfo({ ...userInfo, email: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Password"
                    value={userInfo.password}
                    onChange={(e) =>
                      setUserInfo({ ...userInfo, password: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirmpassword">Confirm password</Label>
                  <Input
                    id="confirmpassword"
                    type="password"
                    placeholder="Confirm password"
                    value={userInfo.confirmPassword}
                    onChange={(e) =>
                      setUserInfo({
                        ...userInfo,
                        confirmPassword: e.target.value,
                      })
                    }
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col">
                <Button className="w-full" type="submit">
                  Sign Up
                </Button>
                <p className="mt-3 text-sm text-center">
                  Already have an account? <Link to="/login">Login</Link>
                </p>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Signup;
