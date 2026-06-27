import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    TextInputProps,
  } from "react-native";
  import { styles } from "@/styles/auth.styles";
  import BottomSheet, { BottomSheetView, BottomSheetProps } from "@gorhom/bottom-sheet";
  
  type AuthFormProps = {
    title: string;
    label1: string;
    label2: string;
    label3?: string;
    button: string;
    terms: string;
    termsButton: string;
    inputProps1?: TextInputProps;
    inputProps2?: TextInputProps;
    inputProps3?: TextInputProps;
    bottomSheetProps?: BottomSheetProps;
  };
  
  export default function AuthForm({
    title,
    label1,
    label2,
    label3,
    button,
    terms,
    termsButton,
    inputProps1,
    inputProps2,
    inputProps3,
    bottomSheetProps,
  }: AuthFormProps) {
    return (
      <BottomSheet style={styles.bottomSheetStyle} {...bottomSheetProps}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.loginContainer}
        >
          <BottomSheetView style={styles.loginContent}>
            <View style={styles.loginHeader}>
              <Text style={styles.loginTitle}>{title}</Text>
            </View>
  
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{label1}</Text>
              <TextInput style={styles.input} {...inputProps1} />
            </View>
  
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{label2}</Text>
              <TextInput style={styles.input} {...inputProps2} />
            </View>
  
            {label3 && inputProps3 && (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>{label3}</Text>
                <TextInput style={styles.input} {...inputProps3} />
              </View>
            )}
  
            <TouchableOpacity style={styles.loginButton}>
              <Text style={styles.loginButtonText}>{button}</Text>
            </TouchableOpacity>
  
            <View style={styles.termsContainer}>
              <Text style={styles.termsText}>{terms}</Text>
              <TouchableOpacity>
                <Text style={styles.termsTextLink}>{termsButton}</Text>
              </TouchableOpacity>
            </View>
          </BottomSheetView>
        </KeyboardAvoidingView>
      </BottomSheet>
    );
  }
  