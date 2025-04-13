
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";

const userRoleSchema = z.object({
  name: z.string().min(1, "Please enter your name"),
  role: z.enum(["student", "professional", "freelancer", "entrepreneur", "other"], {
    required_error: "Please select your role",
  }),
  focusHours: z
    .string()
    .refine((val) => {
      const hours = parseInt(val);
      return !isNaN(hours) && hours > 0 && hours <= 20;
    }, "Please enter a valid number between 1 and 20")
});

type UserRoleFormValues = z.infer<typeof userRoleSchema>;

export default function QuestionnairePage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<UserRoleFormValues>({
    resolver: zodResolver(userRoleSchema),
    defaultValues: {
      name: "",
      role: undefined,
      focusHours: "4",
    },
  });

  const onSubmit = async (data: UserRoleFormValues) => {
    setSubmitting(true);
    try {
      // For skipped login users, we store the preferences in localStorage
      localStorage.setItem('xenon_user_name', data.name);
      localStorage.setItem('xenon_user_role', data.role);
      localStorage.setItem('xenon_focus_hours', data.focusHours);
      
      // Navigate to home page after questionnaire
      navigate("/home");
    } catch (error) {
      console.error("Failed to save preferences:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md bg-black/80 backdrop-blur-lg border border-purple-600/30 shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-medium text-center text-white">
            Tell us about yourself
          </CardTitle>
          <CardDescription className="text-center text-gray-400">
            Help us personalize your experience
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
                    <FormLabel className="text-gray-200">What's your name?</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your name"
                        className="bg-gray-900/50 border-gray-700 text-white focus-visible:ring-purple-600"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-gray-200">What is your role?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="student" className="border-purple-600 text-purple-600" />
                          </FormControl>
                          <FormLabel className="text-white font-normal">Student</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="professional" className="border-purple-600 text-purple-600" />
                          </FormControl>
                          <FormLabel className="text-white font-normal">Working Professional</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="freelancer" className="border-purple-600 text-purple-600" />
                          </FormControl>
                          <FormLabel className="text-white font-normal">Freelancer</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="entrepreneur" className="border-purple-600 text-purple-600" />
                          </FormControl>
                          <FormLabel className="text-white font-normal">Entrepreneur</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="other" className="border-purple-600 text-purple-600" />
                          </FormControl>
                          <FormLabel className="text-white font-normal">Other</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="focusHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-200">
                      How many hours do you want to focus daily?
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="20"
                        className="bg-gray-900/50 border-gray-700 text-white focus-visible:ring-purple-600"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                disabled={submitting}
              >
                {submitting ? "Saving..." : "Continue"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
