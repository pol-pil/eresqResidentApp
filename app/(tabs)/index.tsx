import React, {
   useCallback,
   useEffect,
   useMemo,
   useRef,
   useState,
} from "react";
import {
   BackHandler,
   Image,
   Keyboard,
   KeyboardAvoidingView,
   Platform,
   Text,
   TextInput,
   TouchableOpacity,
   TouchableWithoutFeedback,
   View,
   ActivityIndicator,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import * as Location from "expo-location";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import BottomSheet, {
   BottomSheetScrollViewMethods,
} from "@gorhom/bottom-sheet";
import { useUser } from "@clerk/clerk-expo";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Ionicons } from "@expo/vector-icons";
import { Checkbox, List, RadioButton } from "react-native-paper";
import { moderateScale } from "@/constants/responsive";
import { Id } from "@/convex/_generated/dataModel";

import GoogleMapView from "@/components/googleMapView";
import AlertButton from "@/components/alertButton";
import { COLORS } from "@/constants/theme";
import { styles } from "../../styles/home.styles";
import BottomSheetWrapper from "@/components/BottomSheetWrapper";
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

const LocationInput = ({
   value,
   onChange,
   error,
   street = [],
}: {
   value: string;
   onChange: (text: string) => void;
   error?: string;
   street?: string[];
}) => {
   const [showDropdown, setShowDropdown] = useState(false);

   const filteredStreet = street.filter((loc) =>
      loc.toLowerCase().includes(value.toLowerCase())
   );

   return (
      <View style={styles.inputContainer}>
         <Text style={styles.inputLabel}>Current Location</Text>

         <TextInput
            style={[
               styles.input,
               error ? { backgroundColor: COLORS.error } : {},
            ]}
            value={value}
            placeholder="Pick/Enter your location"
            onChangeText={(text) => {
               onChange(text);
               setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
         />

         {error && (
            <Text style={{ color: COLORS.health, marginTop: 4 }}>{error}</Text>
         )}

         {showDropdown && filteredStreet.length > 0 && (
            <View
               style={{
                  position: "absolute",
                  top: 100,
                  backgroundColor: "#fff",
                  borderRadius: 6,
                  borderWidth: 1,
                  borderColor: "#ddd",
                  zIndex: 9999,
               }}
            >
               {filteredStreet.map((item) => (
                  <TouchableOpacity
                     key={item}
                     onPress={() => {
                        onChange(item);
                        setShowDropdown(false);
                     }}
                     style={{
                        padding: 12,
                        borderBottomWidth: 1,
                        borderBottomColor: "#eee",
                     }}
                  >
                     <Text
                        style={{
                           fontFamily: "Poppins-Regular",
                           fontSize: moderateScale(16),
                        }}
                     >
                        {item}
                     </Text>
                  </TouchableOpacity>
               ))}
            </View>
         )}
      </View>
   );
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
   <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>Description</Text>
      <TextInput
         style={[styles.input, error ? { backgroundColor: COLORS.error } : {}]}
         placeholder="Provide a brief description"
         value={value}
         onChangeText={onChange}
      />
      {error && (
         <Text style={{ color: COLORS.health, marginTop: 4 }}>{error}</Text>
      )}
   </View>
);

const AlertLevelSelector = ({
   level,
   setLevel,
   selectedCategory,
}: {
   level: string;
   setLevel: (level: string) => void;
   selectedCategory: string;
}) => {
   const options = [
      { value: "Non-Urgent", color: "#259835" },
      { value: "Urgent", color: "#FB9A0E" },
      { value: "Immediate", color: "#FF4545" },
   ];

   useEffect(() => {
      if (selectedCategory === "Fire Emergency" && level !== "Immediate") {
         setLevel("Immediate");
      }
   }, [selectedCategory]);

   return (
      <View style={styles.inputContainer}>
         <Text style={styles.inputLabel}>Alert Level</Text>
         <View
            style={{
               flexDirection: "row",
               borderRadius: 8,
               overflow: "hidden",
            }}
         >
            {options.map((opt, index) => {
               const isSelected = opt.value === level;
               const disabled = selectedCategory === "Fire Emergency";
               return (
                  <TouchableOpacity
                     key={opt.value}
                     style={{
                        flex: 1,
                        paddingTop: 18,
                        paddingBottom: 16,
                        backgroundColor: isSelected ? opt.color : COLORS.inp,
                        alignItems: "center",
                        justifyContent: "center",
                        borderRightWidth: index < options.length - 1 ? 1 : 0,
                        borderRightColor: "#c4c8cb",
                        opacity: disabled && !isSelected ? 0.5 : 1,
                     }}
                     onPress={() => !disabled && setLevel(opt.value)}
                     disabled={disabled}
                  >
                     <Text
                        style={{
                           color: isSelected ? "#FFF" : "#909396",
                           fontFamily: isSelected
                              ? "Poppins-Bold"
                              : "Poppins-Regular",
                           fontSize: moderateScale(14),
                        }}
                     >
                        {opt.value}
                     </Text>
                  </TouchableOpacity>
               );
            })}
         </View>
         <View style={{ flexDirection: "row", marginTop: 2, marginBottom: 8 }}>
            <Text style={styles.alertLevelGuideText}>&gt;30 mins</Text>
            <Text style={styles.alertLevelGuideText}>10-30 mins</Text>
            <Text style={styles.alertLevelGuideText}>&lt;10 mins</Text>
         </View>
      </View>
   );
};

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

export default function Index() {
   const router = useRouter();
   const { user } = useUser();

   const [coords, setCoords] = useState<{
      latitude: number;
      longitude: number;
   } | null>(null);
   const [address, setAddress] =
      useState<Location.LocationGeocodedAddress | null>(null);
   const [alertLocation, setAlertLocation] = useState("");
   const [locationError, setLocationError] = useState("");
   const [alertLevel, setAlertLevel] = useState("Non-Urgent");
   const [relatedCategory, setRelatedCategory] = useState<string[]>([]);
   const [accordionExpanded, setAccordionExpanded] = useState(false);
   const [alertDescription, setAlertDescription] = useState("");
   const [descriptionError, setDescriptionError] = useState("");
   const [selectedCategory, setSelectedCategory] = useState("");
   const [lastAlertId, setLastAlertId] = useState<Id<"alerts"> | null>(null);
   const [responseOpen, setResponseOpen] = useState(false);

   const [isCreatingAlert, setIsCreatingAlert] = useState(false);
   const [isCancelingAlert, setIsCancelingAlert] = useState(false);
   const [isFetchingLocation, setIsFetchingLocation] = useState(false);

   const bottomSheetCategory = useRef<BottomSheet>(null);
   const bottomSheetAlert = useRef<BottomSheet>(null);
   const bottomSheetResponse = useRef<BottomSheet>(null);
   const scrollRef = useRef<BottomSheetScrollViewMethods>(
      {} as BottomSheetScrollViewMethods
   );

   const [currentSnapIndexCategory, setCurrentSnapIndexCategory] = useState(0);
   const [currentSnapIndexAlert, setCurrentSnapIndexAlert] = useState(0);
   const [currentSnapIndexResponse, setCurrentSnapIndexResponse] = useState(0);

   const createAlert = useMutation(api.alert.createAlert);
   const cancelAlertMutation = useMutation(api.alert.cancelAlert);
   const tokens = useQuery(api.userTokens.getTokens);

   const alertData = useQuery(
      api.alert.getAlertById,
      lastAlertId ? { alertId: lastAlertId } : "skip"
   );

   const currentUserAddress = useQuery(api.users.getCurrentUserAddress) || "";

   useEffect(() => {
      (async () => {
         try {
            setIsFetchingLocation(true);
            const { status } =
               await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") return;

            const location = await Location.getCurrentPositionAsync({});
            setCoords(location.coords);

            const [geoAddress] = await Location.reverseGeocodeAsync(
               location.coords
            );
            setAddress(geoAddress);
            setAlertLocation(geoAddress.city || "");
         } catch (err) {
            console.log("Location error:", err);
         } finally {
            setIsFetchingLocation(false);
         }
      })();
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
            setAlertLevel("Non-Urgent");
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

   useEffect(() => {
      const backAction = () => {
         if (currentSnapIndexAlert > 0 || currentSnapIndexCategory > 0) {
            bottomSheetAlert.current?.close();
            bottomSheetCategory.current?.expand();
            bottomSheetResponse.current?.close();
            return true;
         }
         return false;
      };

      const backHandler = BackHandler.addEventListener(
         "hardwareBackPress",
         backAction
      );
      return () => backHandler.remove();
   }, [currentSnapIndexAlert, currentSnapIndexCategory]);

   useFocusEffect(
      useCallback(() => {
         const timeout = setTimeout(() => {
            bottomSheetCategory.current?.expand();
            bottomSheetAlert.current?.close();
            bottomSheetResponse.current?.close();
         }, 800);
         return () => clearTimeout(timeout);
      }, [])
   );

   // --- Handlers ---
   const handleLocationChange = (text: string) => {
      setAlertLocation(text);
      if (!text.trim()) setLocationError("Location is required.");
      else if (!/^[\p{L}0-9\s.'-,]+$/u.test(text))
         setLocationError("Enter a valid location.");
      else setLocationError("");
   };

   const handleDescriptionChange = (text: string) => {
      setAlertDescription(text);
      if (text.length > 200)
         setDescriptionError("Description must be less than 200 characters.");
      else if (!/^[\p{L}0-9\s.,'!?:-]*$/u.test(text))
         setDescriptionError("Description contains invalid characters.");
      else setDescriptionError("");
   };

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

      if (categoryName === "Fire Emergency") {
         setAlertLevel("Immediate");
      } else if (alertLevel === "Immediate") {
         setAlertLevel("Non-Urgent");
      }
   };

   const closeAlert = () => {
      bottomSheetAlert.current?.close();
      bottomSheetCategory.current?.expand();
      Keyboard.dismiss();
   };

   const closeResponse = async () => {
      if (lastAlertId) {
         try {
            setIsCancelingAlert(true);
            await cancelAlertMutation({ alertId: lastAlertId });
            console.log("Alert canceled successfully");
         } catch (error) {
            console.log("Failed to cancel alert", error);
         } finally {
            setIsCancelingAlert(false);
         }
      }
      setResponseOpen(false);
      bottomSheetResponse.current?.close();
      bottomSheetCategory.current?.expand();
   };

   const removeResponse = async () => {
      setResponseOpen(false);
      bottomSheetResponse.current?.close();
      bottomSheetCategory.current?.expand();
   };

   const isAlertValid = () =>
      !locationError && !descriptionError && alertLocation.trim();

   const handleAlert = async () => {
      handleLocationChange(alertLocation);
      if (!isAlertValid()) return;

      const sanitizedLocation = alertLocation.replace(
         /[^\p{L}0-9\s.'-,]/gu,
         ""
      );
      const sanitizedDescription = alertDescription
         .trim()
         .slice(0, 200)
         .replace(/[^\p{L}0-9\s.,'!?:-]/gu, "");

      try {
         setIsCreatingAlert(true);
         const alertId = await createAlert({
            location: sanitizedLocation,
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
                     `${alertLevel} level at ${sanitizedLocation}`
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
         setIsCreatingAlert(false);
      }
   };

   const selectedTitle =
      relatedCategory.length > 0 ? relatedCategory.join(", ") : "None";

   const renderResponders = () => {
      const responders = alertData?.responder ?? [];

      if (responders.length === 0) {
         return <Text style={styles.responseText}>No responders yet.</Text>;
      }

      return responders.map((responderId) => (
         <Text key={responderId} style={styles.responseText3}>
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
            <Text style={styles.responseText}>
               Alert location not available.
            </Text>
         );
      }

      if (!responderLats.length || !responderLngs.length) {
         return (
            <Text style={styles.responseText}>No responder en route yet.</Text>
         );
      }

      const haversineDistance = (
         lat1: number,
         lon1: number,
         lat2: number,
         lon2: number
      ) => {
         const toRad = (value: number) => (value * Math.PI) / 180;
         const R = 6371; 

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
         <Text style={styles.responseText2}>
            ETA: {displayHours}:{displayMinutes} {ampm}
         </Text>
      );
   };

   const renderStatus = () => {
      const status = alertData?.status ?? "pending";

      let responseStatus = "";
      switch (status) {
         case "Resolved":
            responseStatus = "Close";
            break;
         default:
            responseStatus = "Cancel Alert";
      }

      return <Text style={styles.responseCancelText}>{responseStatus}</Text>;
   };

   return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
         <GestureHandlerRootView style={styles.container}>
            <GoogleMapView />
            {!responseOpen && (
               <TouchableOpacity onPress={() => router.push("/profile")}>
                  <View style={styles.profile}>
                     {user?.imageUrl && (
                        <Image
                           source={{ uri: user.imageUrl }}
                           style={styles.profileImage}
                        />
                     )}
                  </View>
               </TouchableOpacity>
            )}

            {/* --- Category BottomSheet --- */}
            <BottomSheetWrapper
               ref={bottomSheetCategory}
               onChange={handleSheetCategory}
               snapPoints={snapPointsCategory}
            >
               <View style={styles.category}>
                  <Text style={styles.inputLabel}>Alert Category</Text>
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

            {/* --- Alert BottomSheet --- */}
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
                  <View style={styles.confirmContent}>
                     <View style={styles.confirmHeader}>
                        <Text style={styles.confirmTitle}>
                           {selectedCategory}
                        </Text>
                        <TouchableOpacity onPress={closeAlert}>
                           <Ionicons name="close" style={styles.iconNormal} />
                        </TouchableOpacity>
                     </View>

                     {isFetchingLocation && (
                        <View style={styles.loadingContainer}>
                           <ActivityIndicator size="small" color={COLORS.health} />
                           <Text style={styles.loadingText}>Getting your location...</Text>
                        </View>
                     )}

                     <LocationInput
                        value={alertLocation}
                        onChange={handleLocationChange}
                        error={locationError}
                        street={[
                           ...(currentUserAddress ? [currentUserAddress] : []),
                           "Block 1",
                           "Block 2",
                           "Block 3",
                           "Block 4",
                           "Block 5",
                           "Block 6",
                        ]}
                     />

                     <AlertLevelSelector
                        level={alertLevel}
                        setLevel={setAlertLevel}
                        selectedCategory={selectedCategory}
                     />

                     <View style={styles.anotherContainer}>
                        <Text style={styles.inputLabel}>
                           Another Alert Category Related
                        </Text>
                        <View style={styles.relatedContainer}>
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
                           styles.alertButton,
                           (!isAlertValid() || isCreatingAlert) && { opacity: 0.5 },
                        ]}
                        onPress={handleAlert}
                        disabled={!isAlertValid() || isCreatingAlert}
                     >
                        {isCreatingAlert ? (
                           <View style={styles.alertButtonLoading}>
                              <ActivityIndicator size="small" color="#FFF" />
                              <Text style={styles.alertButtonText}>Sending Alert...</Text>
                           </View>
                        ) : (
                           <>
                              <Text style={styles.alertButtonText}>Alert</Text>
                              <Ionicons
                                 style={styles.alertIcon}
                                 name="warning-outline"
                              />
                           </>
                        )}
                     </TouchableOpacity>

                     <View>
                        <Text style={styles.policyText}>
                           All reports are subject to verification. False
                           information or pranks will be penalized in accordance
                           with barangay regulations.
                        </Text>
                     </View>
                  </View>
               </KeyboardAwareScrollView>
            </BottomSheetWrapper>

            {/* --- Response BottomSheet --- */}
            <BottomSheetWrapper
               ref={bottomSheetResponse}
               onChange={handleSheetResponse}
               snapPoints={snapPointsResponse}
            >
               <View style={styles.confirmContent}>
                  {alertData?.status === "Resolved" && (
                     <>
                        <View style={styles.confirmHeader}>
                           <Text style={styles.responseTitle}>
                              Alert is resolved
                           </Text>
                        </View>

                        {alertData?.responder && (
                           <View style={styles.inputContainer}>
                              <Text style={styles.inputLabel}>Responders:</Text>
                              {renderResponders()}
                           </View>
                        )}

                        <TouchableOpacity
                           style={styles.responseCancelButton}
                           onPress={() => router.push("/profile")}
                        >
                           <Text style={styles.responseCancelText}>View History</Text>
                        </TouchableOpacity>
                     </>
                  )}
                  {alertData?.status === "Active" && (
                     <>
                        {!alertData?.responder ||
                        alertData.responder.length === 0 ? (
                           <View style={styles.confirmHeader}>
                              <Text style={styles.responseTitle}>
                                 Alert has been successfully sent
                              </Text>
                           </View>
                        ) : (
                           <View style={styles.confirmHeader}>
                              <Text style={styles.responseTitle}>
                                 Help is on the way
                              </Text>
                              {renderETA()}
                           </View>
                        )}
                        <View style={styles.inputContainer}>
                           <Text style={styles.responseTextE}>
                              Emergency units have been notified. Stay calm, and
                              they may contact you for more details.
                           </Text>
                        </View>

                        {alertData?.responder && (
                           <View style={styles.inputContainer}>
                              <Text style={styles.inputLabel}>Responders:</Text>
                              {renderResponders()}
                           </View>
                        )}

                        <TouchableOpacity
                           style={[
                              styles.responseCancelButton,
                              isCancelingAlert && { opacity: 0.5 }
                           ]}
                           onPress={closeResponse}
                           disabled={isCancelingAlert}
                        >
                           {isCancelingAlert ? (
                              <View style={styles.cancelButtonLoading}>
                                 <ActivityIndicator size="small" color="#FF4545" />
                                 <Text style={styles.responseCancelText}>Canceling...</Text>
                              </View>
                           ) : (
                              <Text style={styles.responseCancelText}>
                                 Cancel Alert
                              </Text>
                           )}
                        </TouchableOpacity>
                     </>
                  )}
               </View>
            </BottomSheetWrapper>
         </GestureHandlerRootView>
      </TouchableWithoutFeedback>
   );
}