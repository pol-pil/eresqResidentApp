import {
   View,
   Text,
   Image,
   TouchableOpacity,
   Keyboard,
   KeyboardAvoidingView,
   TouchableWithoutFeedback,
   Platform,
   Pressable,
   GestureResponderEvent,
   Alert,
   TextInput,
   StyleSheet,
   Vibration,
   ActivityIndicator, // Added ActivityIndicator
} from "react-native";
import { COLORS } from "@/constants/theme";
import { styles } from "@/styles/auth.styles";
import { styles as stylesh } from "@/styles/home.styles";
import { Ionicons } from "@expo/vector-icons";
import BottomSheet, {
   BottomSheetScrollView,
   BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { set, useForm } from "react-hook-form";
import CustomInput from "@/components/CustomInput";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
   isClerkAPIResponseError,
   useSignIn,
   useSignUp,
} from "@clerk/clerk-expo";
import { useFocusEffect } from "expo-router";
import { moderateScale, verticalScale } from "@/constants/responsive";
import * as Location from "expo-location";
import BottomSheetWrapper from "@/components/BottomSheetWrapper";
import { Checkbox, List } from "react-native-paper";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import AlertButton from "@/components/alertButton";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

const ALERT_CATEGORIES = [
   {
      id: 1,
      name: "Health Emergency",
      iconName: "medkit-outline",
      iconColor: COLORS.health,
   },
   {
      id: 2,
      name: "Fire Emergency",
      iconName: "flame-outline",
      iconColor: COLORS.fire,
   },
   {
      id: 3,
      name: "Flood or Weather Disaster",
      iconName: "rainy-outline",
      iconColor: COLORS.flood,
   },
   {
      id: 4,
      name: "Crime or Security Threat",
      iconName: "warning-outline",
      iconColor: COLORS.crime,
   },
];

const EMERGENCY_TYPES = [
   { label: "Health Emergency", color: "#FF4545" },
   { label: "Fire Emergency", color: "#FB8C0E" },
   { label: "Flood or Weather Disaster", color: "#0E79FB" },
   { label: "Crime or Security Threat", color: "#353C51" },
];

const loginSchema = z.object({
   email: z
      .string({ message: "Email is required" })
      .email("Invalid email")
      .max(100, "Email should be less than 100 characters")
      .regex(
         /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
         "Email should not have invalid characters"
      ),
   password: z
      .string({ message: "Password is required" })
      .min(8, "Password should be at least 8 characters long")
      .max(100, "Password should be less than 100 characters")
      .regex(
         /^\d*[A-Za-z]+\d*[A-Za-z]*\d*$/,
         "Password must contain only letters and numbers"
      ),
});
type loginFields = z.infer<typeof loginSchema>;

const signUpSchema = z
   .object({
      firstName: z
         .string({ message: "First name is required" })
         .min(1, "First name is required")
         .max(50, "First name should be less than 50 characters")
         .regex(/^[\p{L}0-9\s.'-,]+$/u, "Invalid characters"),
      lastName: z
         .string({ message: "Last name is required" })
         .min(1, "Last name is required")
         .max(50, "Last name should be less than 50 characters")
         .regex(/^[\p{L}0-9\s.'-,]+$/u, "Invalid characters"),
      address: z
         .string({ message: "Address is required" })
         .min(1, "Address is required")
         .max(100, "Address should be less than 100 characters")
         .regex(/^[\p{L}0-9\s.'-,]+$/u, "Invalid characters"),
      contactNumber: z
         .string({ message: "Phone number is required" })
         .min(11, "Phone number must be 11 digits")
         .max(11, "Phone number must be 11 digits")
         .regex(/^09\d{9}$/, "Invalid phone number format"),
      email: z
         .string({ message: "Email is required" })
         .email("Invalid email")
         .max(100, "Email should be less than 100 characters")
         .regex(
            /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
            "Email should not have invalid characters"
         ),
      password: z
         .string({ message: "Password is required" })
         .min(8, "Password should be at least 8 characters long")
         .max(100, "Password should be less than 100 characters")
         .regex(
            /^\d*[A-Za-z]+\d*[A-Za-z]*\d*$/,
            "Password must contain only letters and numbers"
         ),
      confirmPassword: z.string({ message: "Please confirm your password" }),
   })
   .refine((data) => data.password === data.confirmPassword, {
      path: ["confirmPassword"],
      message: "Passwords do not match",
   });
type signUpFields = z.infer<typeof signUpSchema>;

const verifySchema = z.object({
   code: z.string({ message: "Code is required" }).length(6, "Invalid code"),
});
type verifyFields = z.infer<typeof verifySchema>;

const mapClerkErrorToFormFieldLogin = (error: any) => {
   switch (error.meta?.paramName) {
      case "identifier":
         return "email";
      case "password":
         return "password";
      default:
         return "root";
   }
};

const mapClerkErrorToFormFieldSignup = (error: any) => {
   switch (error.meta?.paramName) {
      case "email_address":
         return "email";
      case "password":
         return "password";
      default:
         return "root";
   }
};

const mapClerkErrorToFormFieldVerify = (error: any) => {
   switch (error.meta?.paramName) {
      case "code":
         return "code";
      default:
         return "root";
   }
};

const DescriptionInput = ({
   value,
   onChange,
   error,
}: {
   value: string;
   onChange: (text: string) => void;
   error?: string;
}) => (
   <View style={stylesh.inputContainer}>
      <Text style={stylesh.inputLabel}>Description</Text>
      <TextInput
         style={[stylesh.input, error ? { backgroundColor: COLORS.error } : {}]}
         placeholder="Provide a brief description"
         value={value}
         onChangeText={onChange}
      />
      {error && (
         <Text style={{ color: COLORS.health, marginTop: 4 }}>{error}</Text>
      )}
   </View>
);

async function sendPushNotification(
   expoPushToken: string,
   title: string,
   body: string
) {
   await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
         Accept: "application/json",
         "Accept-encoding": "gzip, deflate",
         "Content-Type": "application/json",
      },
      body: JSON.stringify({
         to: expoPushToken,
         sound: "default",
         title,
         body,
      }),
   });
}

export default function Login() {
   useFocusEffect(
      useCallback(() => {
         const timeout = setTimeout(() => {
            bottomSheetCategory.current?.close();
            bottomSheetAlert.current?.close();
            bottomSheetResponse.current?.close();
            bottomSheetVerify.current?.close();
            bottomSheetSignUp1.current?.close();
            bottomSheetLogin.current?.expand();
         }, 500);

         return () => clearTimeout(timeout);
      }, [])
   );

   const bottomSheetLogin = useRef<BottomSheet>(null);
   const bottomSheetSignUp1 = useRef<BottomSheet>(null);
   const bottomSheetVerify = useRef<BottomSheet>(null);
   const bottomSheetAlert = useRef<BottomSheet>(null);

   const [coords, setCoords] = useState<{
      latitude: number;
      longitude: number;
   } | null>(null);
   const [address, setAddress] =
      useState<Location.LocationGeocodedAddress | null>(null);
   const [alertLocation, setAlertLocation] = useState("");
   const [locationError, setLocationError] = useState("");
   const [alertLevel, setAlertLevel] = useState("Immediate");
   const [relatedCategory, setRelatedCategory] = useState<string[]>([]);
   const [accordionExpanded, setAccordionExpanded] = useState(false);
   const [alertDescription, setAlertDescription] = useState("");
   const [descriptionError, setDescriptionError] = useState("");
   const [selectedCategory, setSelectedCategory] = useState("");
   const [lastAlertId, setLastAlertId] = useState<Id<"alerts"> | null>(null);
   const [responseOpen, setResponseOpen] = useState(false);

   const [isLoggingIn, setIsLoggingIn] = useState(false);
   const [isSigningUp, setIsSigningUp] = useState(false);
   const [isVerifying, setIsVerifying] = useState(false);
   const [isSendingAlert, setIsSendingAlert] = useState(false);
   const [isGettingLocation, setIsGettingLocation] = useState(false);

   const bottomSheetCategory = useRef<BottomSheet>(null);
   const bottomSheetResponse = useRef<BottomSheet>(null);

   const [currentSnapIndexCategory, setCurrentSnapIndexCategory] = useState(0);
   const [currentSnapIndexAlert, setCurrentSnapIndexAlert] = useState(0);
   const [currentSnapIndexResponse, setCurrentSnapIndexResponse] = useState(0);

   const createAlert = useMutation(api.alert.createAlert);
   const cancelAlertMutation = useMutation(api.alert.cancelAlert);
   const tokens = useQuery(api.userTokens.getTokens);

   const [sosOpen, setSosOpen] = useState(false);

   const alertData = useQuery(
      api.alert.getAlertById,
      lastAlertId ? { alertId: lastAlertId } : "skip"
   );

   const selectedTitle =
      relatedCategory.length > 0 ? relatedCategory.join(", ") : "None";

   const isAlertValid = () =>
      !locationError && !descriptionError && alertLocation.trim();

   const handleAlert = async () => {
      if (!isAlertValid()) return;

      const sanitizedDescription = alertDescription
         .trim()
         .slice(0, 200)
         .replace(/[^\p{L}0-9\s.,'!?:-]/gu, "");

      try {
         setIsSendingAlert(true);
         const alertId = await createAlert({
            location: alertLocation,
            category: selectedCategory,
            latitude: coords?.latitude,
            longitude: coords?.longitude,
            alertLevel,
            description: sanitizedDescription,
            relatedCategory: relatedCategory.join(", "),
            status: "Active",
         });

         if (tokens && tokens.length > 0) {
            console.log("Fetched tokens:", tokens);

            await Promise.all(
               tokens.map((t) =>
                  sendPushNotification(
                     t.token,
                     `🚨 ${selectedCategory} Alert`,
                     `${alertLevel} level at ${alertLocation}`
                  )
               )
            );
         }

         setLastAlertId(alertId);
         setResponseOpen(true);
         bottomSheetResponse.current?.expand();
      } catch (error) {
         console.log("Error sending alert", error);
      } finally {
         setIsSendingAlert(false);
      }
   };

   const LocationInput = ({
      value,
      onChange,
      error,
   }: {
      value: string;
      onChange: (text: string) => void;
      error?: string;
   }) => (
      <View style={[stylesh.inputContainer, { marginBottom: 40 }]}>
         <Text style={stylesh.inputLabel}>Current Location</Text>
         <TextInput
            style={[
               stylesh.input,
               { color: COLORS.grey },
               error ? { backgroundColor: COLORS.error } : {},
            ]}
            value={value}
            placeholder="Enter your specific location"
            onChangeText={onChange}
            editable={false}
         />
         {error && (
            <Text style={{ color: COLORS.health, marginTop: 4 }}>{error}</Text>
         )}
      </View>
   );

   const toggleCheckbox = (label: string) =>
      setRelatedCategory((prev) =>
         prev.includes(label)
            ? prev.filter((item) => item !== label)
            : [...prev, label]
      );

   const categoryChoice = (categoryName: string) => {
      setAlertLocation(address?.city || "");
      bottomSheetCategory.current?.collapse();
      bottomSheetAlert.current?.expand();
      setSelectedCategory(categoryName);
   };

   const handleDescriptionChange = (text: string) => {
      setAlertDescription(text);
      if (text.length > 200)
         setDescriptionError("Description must be less than 200 characters.");
      else if (!/^[\p{L}0-9\s.,'!?:-]*$/u.test(text))
         setDescriptionError("Description contains invalid characters.");
      else setDescriptionError("");
   };

   const handleLocationChange = (text: string) => {
      setAlertLocation(text);
      if (!text.trim()) setLocationError("Location is required.");
      else if (!/^[\p{L}0-9\s.'-,]+$/u.test(text))
         setLocationError("Enter a valid location.");
      else setLocationError("");
   };

   const handleSheetLogin = useCallback((index: number) => {
      Keyboard.dismiss();
      if (index === -1) {
         resetLoginForm();
      }
   }, []);
   const handleSheetSignUp1 = useCallback((index: number) => {
      Keyboard.dismiss();
      if (index === -1) {
         resetSignUpForm();
      }
   }, []);
   const handleSheetVerify = useCallback((index: number) => {
      Keyboard.dismiss();
      if (index === -1) {
         resetVerifyForm();
      }
   }, []);
   const handleSheetCategory = useCallback(
      (index: number) => setCurrentSnapIndexCategory(index),
      []
   );
   const handleSheetAlert = useCallback(
      (index: number) => {
         setCurrentSnapIndexAlert(index);
         Keyboard.dismiss();
         if (index === -1) {
            setAlertLocation(address?.city || "");
            setLocationError("");
            setDescriptionError("");
            setAccordionExpanded(false);
            setRelatedCategory([]);
            setAlertDescription("");
            setAlertLevel("Immediate");
         }
      },
      [address?.city]
   );
   const handleSheetResponse = useCallback((index: number) => {
      setCurrentSnapIndexResponse(index);
      if (index >= 0) {
         bottomSheetCategory.current?.close();
         bottomSheetAlert.current?.close();
      }
   }, []);

   const snapPointsCategory = useMemo(() => ["8%"], []);
   const snapPointsAlert = useMemo(() => ["12%"], []);
   const snapPointsResponse = useMemo(() => ["18%"], []);

   const changeLogin = () => {
      bottomSheetLogin.current?.close();
      bottomSheetSignUp1.current?.expand();
   };
   const changeSignUp = () => {
      bottomSheetSignUp1.current?.close();
      bottomSheetLogin.current?.expand();
   };
   const openVerify = () => {
      bottomSheetSignUp1.current?.close();
      bottomSheetVerify.current?.expand();
   };
   const changeVerify = () => {
      bottomSheetVerify.current?.close();
      bottomSheetSignUp1.current?.expand();
   };
   const openAlert = () => {
      bottomSheetLogin.current?.close();
      bottomSheetSignUp1.current?.close();
      bottomSheetVerify.current?.close();
      bottomSheetCategory.current?.expand();
      setSosOpen(true);
   };
   const changeAlert = () => {
      bottomSheetAlert.current?.close();
      bottomSheetLogin.current?.expand();
   };

   //LOG IN
   const {
      control: loginControl,
      handleSubmit: handleLoginSubmit,
      setError,
      formState: { errors },
      reset: resetLoginForm,
   } = useForm({ resolver: zodResolver(loginSchema) });

   const { signIn, isLoaded: isLoginLoaded, setActive } = useSignIn();
   const onLogin = async (data: loginFields) => {
      const sanitizedEmail = data.email.replace(/[^A-Za-z0-9._%+-@]/g, "");
      const sanitizedPassword = data.password.replace(/[^A-Za-z0-9]/g, "");
      if (!isLoginLoaded) return;

      try {
         setIsLoggingIn(true);
         const loginAttempt = await signIn.create({
            identifier: sanitizedEmail,
            password: sanitizedPassword,
         });

         if (loginAttempt.status === "complete") {
            setActive({ session: loginAttempt.createdSessionId });
         } else {
            console.log("Login failed");
            setError("root", { message: "Sign in could not be completed" });
         }
      } catch (error) {
         console.log("Login error: ", JSON.stringify(error, null, 2));

         if (isClerkAPIResponseError(error)) {
            error.errors.forEach((error) => {
               const fieldName = mapClerkErrorToFormFieldLogin(error);
               setError(fieldName, {
                  message: error.longMessage,
               });
            });
         } else {
            setError("root", { message: "Unknown error" });
         }
      } finally {
         setIsLoggingIn(false);
      }
   };

   //SIGN UP
   const {
      control: signUpControl,
      handleSubmit: handleSignUpSubmit,
      setError: setErrorSignup,
      formState: { errors: errorsSignUp },
      reset: resetSignUpForm,
   } = useForm({ resolver: zodResolver(signUpSchema) });

   const { signUp, isLoaded: isSignUpLoaded } = useSignUp();

   const onSignUp = async (data: signUpFields) => {
      const sanitizedEmail = data.email.replace(/[^A-Za-z0-9._%+-@]/g, "");
      const sanitizedPassword = data.password.replace(/[^A-Za-z0-9]/g, "");
      if (!isSignUpLoaded) return;

      try {
         setIsSigningUp(true);
         await signUp.create({
            emailAddress: sanitizedEmail,
            password: sanitizedPassword,
            firstName: data.firstName,
            lastName: data.lastName,
            unsafeMetadata: {
               address: data.address,
               contactNumber: data.contactNumber,
            },
         });

         await signUp.prepareVerification({ strategy: "email_code" });

         openVerify();
      } catch (error) {
         console.log("Sign up error: ", error);
         if (isClerkAPIResponseError(error)) {
            error.errors.forEach((error) => {
               const fieldName = mapClerkErrorToFormFieldSignup(error);
               setErrorSignup(fieldName, {
                  message: error.longMessage,
               });
            });
         } else {
            setErrorSignup("root", { message: "Unknown error" });
         }
      } finally {
         setIsSigningUp(false);
      }
   };

   //VERIFY
   const {
      control: verifyControl,
      handleSubmit: handleVerifySubmit,
      setError: setErrorVerify,
      formState: { errors: errorsVerify },
      reset: resetVerifyForm,
   } = useForm({ resolver: zodResolver(verifySchema) });

   const {
      signUp: verifySignUp,
      isLoaded: isVerifyLoaded,
      setActive: setVerifyActive,
   } = useSignUp();

   const onVerify = async (data: verifyFields) => {
      const sanitizedCode = data.code.replace(/[^0-9]/g, "");
      if (!isVerifyLoaded) return;

      try {
         setIsVerifying(true);
         const signUpAttempt =
            await verifySignUp?.attemptEmailAddressVerification({
               code: sanitizedCode,
            });

         if (signUpAttempt?.status === "complete") {
            setVerifyActive({ session: signUpAttempt.createdSessionId });
         } else {
            console.log("Verification failed");
            console.log(signUpAttempt);
            setError("root", { message: "Could not complete the sign up" });
         }
      } catch (error) {
         console.log("Verify error: ", error);
         if (isClerkAPIResponseError(error)) {
            error.errors.forEach((error) => {
               const fieldName = mapClerkErrorToFormFieldVerify(error);
               setErrorVerify(fieldName, {
                  message: error.longMessage,
               });
            });
         } else {
            setErrorSignup("root", { message: "Unknown error" });
         }
      } finally {
         setIsVerifying(false);
      }
   };

   const handleSos = useCallback(async (event: GestureResponderEvent) => {
      Keyboard.dismiss();
      Vibration.vibrate(200);
      console.log("SOS Pressed");
      resetVerifyForm();

      try {
         setIsGettingLocation(true);
         const { status } = await Location.requestForegroundPermissionsAsync();
         if (status !== "granted") {
            Alert.alert(
               "Permission Denied",
               "Please allow location access to send SOS."
            );
            return;
         }

         const location = await Location.getCurrentPositionAsync({});
         setCoords(location.coords);
         openAlert();

         const [geoAddress] = await Location.reverseGeocodeAsync(location.coords);
         setAddress(geoAddress);
         setAlertLocation(geoAddress.city || "");
      } catch (error) {
         console.log("Location error:", error);
         Alert.alert("Error", "Failed to get your location. Please try again.");
      } finally {
         setIsGettingLocation(false);
      }
   }, []);

   const closeAlert = () => {
      bottomSheetAlert.current?.close();
      bottomSheetCategory.current?.close();
      bottomSheetResponse.current?.close();
      bottomSheetLogin.current?.expand();
      setSosOpen(false);
      Keyboard.dismiss();
   };

   const renderResponders = () => {
      const responders = alertData?.responder ?? [];

      if (responders.length === 0) {
         return <Text style={stylesh.responseText}>No responders yet.</Text>;
      }

      return responders.map((responderId) => (
         <Text key={responderId} style={stylesh.responseText}>
            • {responderId}
         </Text>
      ));
   };

   const renderETA = () => {
      const alertLat = alertData?.latitude;
      const alertLng = alertData?.longitude;

      const responderLats = Array.isArray(alertData?.responderLatitude)
         ? alertData?.responderLatitude
         : alertData?.responderLatitude !== undefined
           ? [alertData?.responderLatitude]
           : [];

      const responderLngs = Array.isArray(alertData?.responderLongitude)
         ? alertData?.responderLongitude
         : alertData?.responderLongitude !== undefined
           ? [alertData?.responderLongitude]
           : [];

      if (!alertLat || !alertLng) {
         return (
            <Text style={stylesh.responseText}>
               Alert location not available.
            </Text>
         );
      }

      if (!responderLats.length || !responderLngs.length) {
         return (
            <Text style={stylesh.responseText}>No responder en route yet.</Text>
         );
      }

      const haversineDistance = (
         lat1: number,
         lon1: number,
         lat2: number,
         lon2: number
      ) => {
         const toRad = (value: number) => (value * Math.PI) / 180;
         const R = 6371; // km

         if (lat2 === 0 && lon2 === 0) return Infinity;

         const dLat = toRad(lat2 - lat1);
         const dLon = toRad(lon2 - lon1);

         const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) *
               Math.cos(toRad(lat2)) *
               Math.sin(dLon / 2) ** 2;

         const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
         return R * c;
      };

      let closestDistance = Infinity;

      for (let i = 0; i < responderLats.length; i++) {
         const dist = haversineDistance(
            alertLat,
            alertLng,
            responderLats[i],
            responderLngs[i]
         );
         if (dist < closestDistance) closestDistance = dist;
      }

      const runningSpeedKmh = 8;
      const etaMinutes =
         Math.round((closestDistance / runningSpeedKmh) * 60) + 1;

      const finalETAminutes =
         etaMinutes > 120 || !isFinite(etaMinutes) ? 10 : etaMinutes;

      const etaTime = new Date();
      etaTime.setMinutes(etaTime.getMinutes() + finalETAminutes);

      const hours = etaTime.getHours();
      const minutes = etaTime.getMinutes();
      const ampm = hours >= 12 ? "PM" : "AM";
      const displayHours = (hours % 12 === 0 ? 12 : hours % 12).toString();
      const displayMinutes = minutes.toString().padStart(2, "0");

      return (
         <Text style={stylesh.responseText2}>
            ETA: {displayHours}:{displayMinutes} {ampm}
         </Text>
      );
   };

   return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
         <GestureHandlerRootView style={styles.container}>
            <View>
               {!sosOpen && (
               <TouchableOpacity
                  style={[
                     styles.sosButton,
                     isGettingLocation && { opacity: 0.7 }
                  ]}
                  onPress={() => {
                     Alert.alert(
                        "Notice",
                        "Press and hold the SOS button for 3 seconds to use."
                     );
                  }}
                  onLongPress={handleSos}
                  delayLongPress={2000}
                  disabled={isGettingLocation}
               >
                  {isGettingLocation ? (
                     <View style={styles.sosButtonLoading}>
                        <ActivityIndicator size="large" color="#FFF" />
                     </View>
                  ) : (
                     <Text style={styles.sosText}>SOS</Text>
                  )}
               </TouchableOpacity>
               )}
            </View>
            <Image
               style={styles.image}
               source={require("../../assets/images/login.png")}
            />
            <BottomSheetWrapper
               ref={bottomSheetLogin}
               onChange={handleSheetLogin}
               snapPoints={[]}
            >
               <KeyboardAwareScrollView
                  contentContainerStyle={{ flexGrow: 1 }}
                  enableOnAndroid={true}
                  extraScrollHeight={20}
               >
                  <View style={styles.loginContent}>
                     <View style={styles.loginHeader}>
                        <Text style={styles.loginTitle}>Log in</Text>
                     </View>

                     <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Email</Text>

                        <CustomInput
                           control={loginControl}
                           name="email"
                           secureTextEntry={false}
                           autoCapitalize="none"
                           keyboardType="email-address"
                           autoComplete="email"
                        />
                     </View>

                     <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Password</Text>
                        <CustomInput
                           control={loginControl}
                           name="password"
                           secureTextEntry={true}
                        />
                        {errors.root && (
                           <Text style={styles.error}>
                              {errors.root.message}
                           </Text>
                        )}
                     </View>

                     <TouchableOpacity
                        style={[
                           styles.loginButton,
                           isLoggingIn && { opacity: 0.7 }
                        ]}
                        onPress={handleLoginSubmit(onLogin)}
                        disabled={isLoggingIn}
                     >
                        {isLoggingIn ? (
                           <View style={styles.buttonLoading}>
                              <ActivityIndicator size="small" color="#FFF" />
                              <Text style={styles.loginButtonText}>Logging in...</Text>
                           </View>
                        ) : (
                           <Text style={styles.loginButtonText}>Log in</Text>
                        )}
                     </TouchableOpacity>

                     <View style={styles.termsContainer}>
                        <Text style={styles.termsText}>
                           Don't have an account?
                        </Text>
                        <TouchableOpacity onPress={changeLogin}>
                           <Text style={styles.termsTextLink}> Sign up</Text>
                        </TouchableOpacity>
                     </View>
                  </View>
               </KeyboardAwareScrollView>
            </BottomSheetWrapper>

            <BottomSheetWrapper
               ref={bottomSheetSignUp1}
               onChange={handleSheetSignUp1}
               snapPoints={[]}
            >
               <KeyboardAwareScrollView
                  contentContainerStyle={{ flexGrow: 1 }}
                  enableOnAndroid={true}
                  extraScrollHeight={20}
               >
                  <View style={styles.loginContent}>
                     <View style={styles.loginHeader}>
                        <Text style={styles.loginTitle}>Sign up</Text>
                     </View>

                     <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>First Name</Text>
                        <CustomInput
                           control={signUpControl}
                           name="firstName"
                           secureTextEntry={false}
                           placeholder="Juan"
                        />
                     </View>

                     <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Last Name</Text>
                        <CustomInput
                           control={signUpControl}
                           name="lastName"
                           secureTextEntry={false}
                           placeholder="Dela Cruz"
                        />
                     </View>

                     <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Address</Text>
                        <CustomInput
                           control={signUpControl}
                           name="address"
                           secureTextEntry={false}
                           placeholder="123, Block 1, Balangkare Norte"
                        />
                     </View>

                     <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Contact Number</Text>
                        <CustomInput
                           control={signUpControl}
                           name="contactNumber"
                           secureTextEntry={false}
                           keyboardType="number-pad"
                           placeholder="09123456789"
                        />
                     </View>

                     <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Email</Text>

                        <CustomInput
                           control={signUpControl}
                           name="email"
                           secureTextEntry={false}
                           autoCapitalize="none"
                           keyboardType="email-address"
                           autoComplete="email"
                           placeholder="abc@gmail.com"
                        />
                     </View>

                     <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Password</Text>
                        <CustomInput
                           control={signUpControl}
                           name="password"
                           secureTextEntry={true}
                        />
                     </View>

                     <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Confirm Password</Text>
                        <CustomInput
                           control={signUpControl}
                           name="confirmPassword"
                           secureTextEntry
                        />
                        {errorsSignUp.root && (
                           <Text style={styles.error}>
                              {errorsSignUp.root.message}
                           </Text>
                        )}
                     </View>

                     <TouchableOpacity
                        style={[
                           styles.loginButton,
                           isSigningUp && { opacity: 0.7 }
                        ]}
                        onPress={handleSignUpSubmit(onSignUp)}
                        disabled={isSigningUp}
                     >
                        {isSigningUp ? (
                           <View style={styles.buttonLoading}>
                              <ActivityIndicator size="small" color="#FFF" />
                              <Text style={styles.loginButtonText}>Creating account...</Text>
                           </View>
                        ) : (
                           <Text style={styles.loginButtonText}>Sign up</Text>
                        )}
                     </TouchableOpacity>

                     <View style={[styles.termsContainer]}>
                        <Text style={styles.termsText}>
                           Already have an account?
                        </Text>
                        <TouchableOpacity onPress={changeSignUp}>
                           <Text style={styles.termsTextLink}>Log in</Text>
                        </TouchableOpacity>
                     </View>
                  </View>
               </KeyboardAwareScrollView>
            </BottomSheetWrapper>

            <BottomSheetWrapper
               ref={bottomSheetVerify}
               onChange={handleSheetVerify}
               snapPoints={[]}
            >
               <KeyboardAwareScrollView
                  contentContainerStyle={{ flexGrow: 1 }}
                  enableOnAndroid={true}
                  extraScrollHeight={20}
               >
                  <View style={styles.loginContent}>
                     <View style={styles.loginHeader}>
                        <Text style={styles.loginTitle}>Verify your email</Text>
                        <TouchableOpacity onPress={changeVerify}>
                           <Ionicons name="close" style={styles.iconNormal} />
                        </TouchableOpacity>
                     </View>

                     <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>
                           Enter the code sent to your email
                        </Text>

                        <CustomInput
                           control={verifyControl}
                           name="code"
                           secureTextEntry={false}
                           autoCapitalize="none"
                           keyboardType="number-pad"
                           autoComplete="one-time-code"
                        />
                        {errorsVerify.root && (
                           <Text style={styles.error}>
                              {errorsVerify.root.message}
                           </Text>
                        )}
                     </View>

                     <TouchableOpacity
                        style={[
                           styles.loginButton,
                           isVerifying && { opacity: 0.7 }
                        ]}
                        onPress={handleVerifySubmit(onVerify)}
                        disabled={isVerifying}
                     >
                        {isVerifying ? (
                           <View style={styles.buttonLoading}>
                              <ActivityIndicator size="small" color="#FFF" />
                              <Text style={styles.loginButtonText}>Verifying...</Text>
                           </View>
                        ) : (
                           <Text style={styles.loginButtonText}>Verify</Text>
                        )}
                     </TouchableOpacity>
                  </View>
               </KeyboardAwareScrollView>
            </BottomSheetWrapper>

            <BottomSheetWrapper
               ref={bottomSheetCategory}
               onChange={handleSheetCategory}
               snapPoints={snapPointsCategory}
            >
               <View style={stylesh.category}>
                  <View style={stylesh.confirmHeader}>
                     <Text style={stylesh.confirmTitle}>SOS</Text>
                     <TouchableOpacity onPress={closeAlert}>
                        <Ionicons name="close" style={stylesh.iconNormal} />
                     </TouchableOpacity>
                  </View>
                  <Text style={stylesh.inputLabel}>Select alert category</Text>
                  {ALERT_CATEGORIES.map((category) => (
                     <AlertButton
                        key={category.id}
                        text={category.name}
                        iconName={category.iconName}
                        iconColor={category.iconColor}
                        onPress={() => categoryChoice(category.name)}
                     />
                  ))}
               </View>
            </BottomSheetWrapper>

            <BottomSheetWrapper
               ref={bottomSheetAlert}
               onChange={handleSheetAlert}
               snapPoints={snapPointsAlert}
            >
               <KeyboardAwareScrollView
                  contentContainerStyle={{ flexGrow: 1 }}
                  enableOnAndroid={true}
                  extraScrollHeight={20}
               >
                  <View style={stylesh.confirmContent}>
                     <View style={stylesh.confirmHeader}>
                        <Text style={stylesh.confirmTitle}>
                           {selectedCategory}
                        </Text>
                        <TouchableOpacity onPress={closeAlert}>
                           <Ionicons name="close" style={stylesh.iconNormal} />
                        </TouchableOpacity>
                     </View>

                     <LocationInput
                        value={alertLocation}
                        onChange={handleLocationChange}
                        error={locationError}
                     />

                     <View style={stylesh.anotherContainer}>
                        <Text style={stylesh.inputLabel}>
                           Another Alert Category Related
                        </Text>
                        <View style={stylesh.relatedContainer}>
                           <List.Accordion
                              title={selectedTitle}
                              titleStyle={{
                                 fontFamily: "Poppins-Regular",
                                 color: "#000",
                                 fontSize: moderateScale(16),
                              }}
                              expanded={accordionExpanded}
                              onPress={() =>
                                 setAccordionExpanded(!accordionExpanded)
                              }
                              theme={{ colors: { background: "transparent" } }}
                           >
                              {EMERGENCY_TYPES.filter(
                                 ({ label }) => label !== selectedCategory
                              ).map(({ label, color }) => (
                                 <List.Item
                                    key={label}
                                    title={label}
                                    titleStyle={{
                                       fontFamily: relatedCategory.includes(
                                          label
                                       )
                                          ? "Poppins-Bold"
                                          : "Poppins-Regular",
                                       fontSize: moderateScale(16),
                                       color: "#000",
                                    }}
                                    left={() => (
                                       <Checkbox
                                          status={
                                             relatedCategory.includes(label)
                                                ? "checked"
                                                : "unchecked"
                                          }
                                          onPress={() => toggleCheckbox(label)}
                                          color={color}
                                          uncheckedColor="#4a4a4a"
                                       />
                                    )}
                                    onPress={() => toggleCheckbox(label)}
                                 />
                              ))}
                           </List.Accordion>
                        </View>
                     </View>

                     <DescriptionInput
                        value={alertDescription}
                        onChange={handleDescriptionChange}
                        error={descriptionError}
                     />

                     <TouchableOpacity
                        style={[
                           stylesh.alertButton,
                           (!isAlertValid() || isSendingAlert) && { opacity: 0.5 },
                        ]}
                        onPress={handleAlert}
                        disabled={!isAlertValid() || isSendingAlert}
                     >
                        {isSendingAlert ? (
                           <View style={stylesh.alertButtonLoading}>
                              <ActivityIndicator size="small" color="#FFF" />
                              <Text style={stylesh.alertButtonText}>Sending Alert...</Text>
                           </View>
                        ) : (
                           <>
                              <Text style={stylesh.alertButtonText}>Alert</Text>
                              <Ionicons
                                 style={stylesh.alertIcon}
                                 name="warning-outline"
                              />
                           </>
                        )}
                     </TouchableOpacity>

                     <View>
                        <Text style={stylesh.policyText}>
                           All reports are subject to verification. False
                           information or pranks will be penalized in accordance
                           with barangay regulations.
                        </Text>
                     </View>
                  </View>
               </KeyboardAwareScrollView>
            </BottomSheetWrapper>

            <BottomSheetWrapper
               ref={bottomSheetResponse}
               onChange={handleSheetResponse}
               snapPoints={snapPointsResponse}
            >
               <View style={stylesh.confirmContent}>
                  {alertData?.status === "Resolved" && (
                     <>
                        <View style={stylesh.confirmHeader}>
                           <Text style={stylesh.responseTitle}>
                              Alert is resolved
                           </Text>
                        </View>

                        {alertData?.responder && (
                           <View style={stylesh.inputContainer}>
                              <Text style={stylesh.inputLabel}>Responders:</Text>
                              {renderResponders()}
                           </View>
                        )}

                        <TouchableOpacity
                           style={stylesh.responseCancelButton}
                           onPress={closeAlert}
                        >
                           <Text style={stylesh.responseCancelText}>Close</Text>
                        </TouchableOpacity>
                     </>
                  )}
                  {alertData?.status === "Active" && (
                     <>
                        {!alertData?.responder ||
                        alertData.responder.length === 0 ? (
                           <View style={stylesh.confirmHeader}>
                              <Text style={stylesh.responseTitle}>
                                 Alert has been successfully sent
                              </Text>
                           </View>
                        ) : (
                           <View style={stylesh.confirmHeader}>
                              <Text style={stylesh.responseTitle}>
                                 Help is on the way
                              </Text>
                              {renderETA()}
                           </View>
                        )}
                        <View style={stylesh.inputContainer}>
                           <Text style={stylesh.responseTextE}>
                              Emergency units have been notified.
                           </Text>
                        </View>

                        {alertData?.responder && (
                           <View style={styles.inputContainer}>
                              <Text style={styles.inputLabel}>Responders:</Text>
                              {renderResponders()}
                           </View>
                        )}
                     </>
                  )}
               </View>
            </BottomSheetWrapper>
         </GestureHandlerRootView>
      </TouchableWithoutFeedback>
   );
}