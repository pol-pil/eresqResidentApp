import { useAuth, useUser, ClerkLoaded, ClerkLoading } from "@clerk/clerk-expo";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { View, ActivityIndicator } from "react-native";

export default function InitialLayout() {
  return (
    <>
      <ClerkLoaded>
        <AppContent />
      </ClerkLoaded>
      <ClerkLoading>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" />
        </View>
      </ClerkLoading>
    </>
  );
}

function AppContent() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const segments = useSegments();
  const router = useRouter();

  const dbUser = useQuery(api.users.getByClerkId, {
    clerkId: user?.id ?? "",
  });

  useEffect(() => {
    const inAuthScreen = segments[0] === "(auth)";

    if (!isSignedIn && !inAuthScreen) {
      router.replace("/(auth)/login");
    } else if (isSignedIn && inAuthScreen) {
      // Small delay to ensure smooth transition
      setTimeout(() => {
        if (dbUser?.status === "pending") {
          router.replace("/(wait)/waiting-approval");
        } else if (dbUser?.status === "approved") {
          router.replace("/(tabs)");
        }
      }, 50);
    }
  }, [isSignedIn, segments, dbUser]);

  return <Stack screenOptions={{ headerShown: false }} />;
}