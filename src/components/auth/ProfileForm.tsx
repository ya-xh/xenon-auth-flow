
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, User as UserIcon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { profileSchema } from "./authSchemas";
import type { ProfileFormValues } from "./authSchemas";

const ProfileForm = () => {
  const { updateProfile, isLoading } = useAuth();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      await updateProfile(data.name);
    } catch (error) {
      console.error("Profile update error:", error);
    }
  };

  return (
    <Card className="w-full max-w-md bg-black/80 backdrop-blur-lg border border-purple-600/30 shadow-xl">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl font-medium text-center text-white">
          Complete Your Profile
        </CardTitle>
        <CardDescription className="text-center text-gray-400">
          Please tell us your name to complete setup
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-200">Your Name</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        className="bg-gray-900/50 border-gray-700 text-white focus-visible:ring-xenon-primary pl-10" 
                        placeholder="Enter your name"
                        {...field}
                      />
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-xenon-primary to-xenon-secondary hover:from-xenon-secondary hover:to-xenon-primary text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>Complete Setup</>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ProfileForm;
