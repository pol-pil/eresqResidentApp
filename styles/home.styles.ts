import { COLORS } from "@/constants/theme";
import { StyleSheet, Dimensions } from "react-native";
import { scale, verticalScale, moderateScale } from "@/constants/responsive";

const { width, height } = Dimensions.get("window");

export const styles = StyleSheet.create({
   map: {
      width: width,
      height: height * 0.92,
      zIndex: 0,
      position: "absolute",
   },
   container: {
      flex: 1,
   },
   category: {
      backgroundColor: COLORS.white,
      padding: scale(20),
      paddingTop: scale(4),
      paddingBottom: scale(20),
   },
   categoryExit: {
      width: "100%",
      height: "100%",
   },
   alertText: {
      marginLeft: scale(20),
      fontSize: moderateScale(14),
      fontFamily: "Poppins-Regular",
   },
   alertContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      width: "100%",
      padding: scale(10),
   },
   iconContainer: {
      backgroundColor: COLORS.health,
      height: scale(50),
      width: scale(50),
      justifyContent: "center",
      alignItems: "center",
      borderRadius: scale(54) / 2,
   },
   icon: {
      color: COLORS.white,
   },
   categoryGroup: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
   },
   confirmContainer: {
      flex: 1,
      justifyContent: "flex-end",
   },
   confirmContent: {
      backgroundColor: COLORS.white,
      padding: scale(30),
      paddingTop: scale(4),
      paddingBottom: scale(30),
      justifyContent: "flex-end",
   },
   confirmHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: scale(10),
   },
   confirmTitle: {
      color: COLORS.black,
      fontFamily: "Poppins-Bold",
      fontSize: moderateScale(20),
   },
   confirmText: {
      color: COLORS.black,
      fontFamily: "Poppins-Regular",
      fontSize: moderateScale(14),
   },
   inputContainer: {
      marginBottom: verticalScale(20),
   },
   inputLabel: {
      color: COLORS.grey,
      fontFamily: "Poppins-Regular",
      fontSize: moderateScale(12),
      marginBottom: verticalScale(5),
   },
   input: {
      backgroundColor: COLORS.inp,
      fontFamily: "Poppins-Regular",
      borderRadius: scale(8),
      padding: scale(14),
      color: COLORS.black,
      fontSize: moderateScale(16),
   },
   alertButton: {
      backgroundColor: COLORS.health,
      padding: scale(10),
      borderRadius: scale(200),
      alignItems: "center",
      marginTop: verticalScale(10),
      paddingTop: verticalScale(14),
      marginBottom: verticalScale(10),
      flexDirection: "row",
      justifyContent: "center",
      shadowColor: "#3d3d3d",
      shadowOffset: {
         width: 0,
         height: 1,
      },
      shadowOpacity: 0.22,
      shadowRadius: 2.22,

      elevation: 3,
   },
   alertButtonDisabled: {
      backgroundColor: COLORS.desc,
      padding: scale(10),
      borderRadius: scale(200),
      alignItems: "center",
      marginTop: verticalScale(10),
      paddingTop: verticalScale(14),
      flexDirection: "row",
      justifyContent: "center",
      shadowColor: "#3d3d3d",
      shadowOffset: {
         width: 0,
         height: 1,
      },
      shadowOpacity: 0.22,
      shadowRadius: 2.22,

      elevation: 3,
   },
   alertButtonText: {
      color: COLORS.white,
      fontFamily: "Poppins-Bold",
      fontSize: moderateScale(22),
   },
   alertIcon: {
      color: COLORS.white,
      fontSize: moderateScale(26),
      marginBottom: verticalScale(6),
      marginLeft: scale(10),
   },

   bottomSheetStyle: {
      borderWidth: 0,
      shadowColor: "#000",
      shadowOffset: {
         width: 0,
         height: 12,
      },
      shadowOpacity: 0.58,
      shadowRadius: 16.0,

      elevation: 24,
   },

   iconNormal: {
      fontSize: moderateScale(20),
      color: COLORS.black,
   },

   radioChoice: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: verticalScale(10),
   },
   radioText: {
      marginLeft: scale(20),
      fontSize: moderateScale(16),
      fontFamily: "Poppins-Regular",
   },
   checkboxRow: {
      flexDirection: "row",
      alignItems: "center",
   },
   anotherContainer: {
      marginTop: -20,
      marginBottom: verticalScale(20),
   },
   relatedContainer: {
      borderRadius: scale(10),
      backgroundColor: COLORS.inp,
      paddingLeft: 10,
      paddingRight: 10,
   },
   policyText: {
      color: COLORS.grey,
      fontFamily: "Poppins-Regular",
      fontSize: moderateScale(10),
      textAlign: "center",
   },
   profileImage: {
      width: 40,
      height: 40,
      borderRadius: 100,
      borderWidth: 2,
      borderColor: COLORS.white,
   },
   profile: {
      position: "absolute",
      top: 10,
      left: 10,
      zIndex: 10,
      elevation: 4,
      borderRadius: 100,
   },
   responseTitle: {
      color: COLORS.green,
      fontFamily: "Poppins-Bold",
      fontSize: moderateScale(20),
   },
   responseTextE: {
      fontFamily: "Poppins-Regular",
      fontSize: moderateScale(14),
      marginBottom: verticalScale(10),
   },
   responseText: {
      fontFamily: "Poppins-Regular",
      fontSize: moderateScale(14),
      marginTop: verticalScale(-10),
      marginBottom: verticalScale(10),
   },
   responseText2: {
      fontFamily: "Poppins-Regular",
      fontSize: moderateScale(14),
   },
   responseText3: {
      fontFamily: "Poppins-Regular",
      fontSize: moderateScale(14),
      marginTop: verticalScale(-6),
   },
   responseCancelButton: {
      alignItems: "center",
      alignSelf: "center",
   },
   responseCancelText: {
      color: COLORS.desc,
      fontFamily: "Poppins-Bold",
      fontSize: moderateScale(18),
   },
   alertLevelGuideText: {
      flex: 1,
      color: COLORS.grey,
      fontFamily: "Poppins-Regular",
      fontSize: moderateScale(12),
      textAlign: "center",
   },
   loadingContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      padding: 10,
      marginBottom: 10,
   },
   loadingText: {
      marginLeft: 8,
      fontFamily: "Poppins-Regular",
      fontSize: moderateScale(14),
      color: COLORS.health,
   },
   alertButtonLoading: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
   },
   cancelButtonLoading: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
   },
});