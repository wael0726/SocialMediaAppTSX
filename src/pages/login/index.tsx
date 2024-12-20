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
import { UserLogIn } from "@/types";
import { Label } from "@radix-ui/react-label";
import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import "@dotlottie/player-component";
import yng from "@/assets/images/yng1.avif"; 

const initialValue: UserLogIn = {
  email: "",
  password: "",
};

const Login: React.FunctionComponent = () => {
  const { googleSignIn, facebookSignIn, logIn } = useUserAuth();
  const navigate = useNavigate();
  const [userLogInInfo, setUserLogInInfo] =
    React.useState<UserLogIn>(initialValue);

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
    try {
      await logIn(userLogInInfo.email, userLogInInfo.password);
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
          alt="Welcome Background"
          className="w-full h-full object-cover"
        />
        {/* Bande horizontale transparente */}
        <div className="absolute bottom-0 w-full h-1/4 bg-black bg-opacity-50 flex flex-col items-center justify-center">
          <h1 className="text-4xl font-bold text-white">Welcome</h1>
          <p className="text-lg text-gray-300 mt-2 font-semibold">
          Please enter your information to login
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
                  Enter your email below to log into your account
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <Button variant="outline" onClick={handleGoogleSignIn}>
                  <Icons.google className="mr-2 h-4 w-4" />
                  Google
                </Button>
                <Button variant="outline" onClick={handleFacebookSignIn}>
                  <Icons.facebook className="mr-2 h-4 w-4 text-blue-600" />
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
                    value={userLogInInfo.email}
                    onChange={(e) =>
                      setUserLogInInfo({
                        ...userLogInInfo,
                        email: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Password"
                    value={userLogInInfo.password}
                    onChange={(e) =>
                      setUserLogInInfo({
                        ...userLogInInfo,
                        password: e.target.value,
                      })
                    }
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col">
                <Button className="w-full" type="submit">
                  Login
                </Button>
                <p className="mt-3 text-sm text-center">
                  Don't have an account? <Link to="/signup">Sign up</Link>
                </p>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
