import { GoogleSignin, statusCodes } from "@react-native-google-signin/google-signin";

GoogleSignin.configure({
    webClientId: "59195371153-artd13lbk3gff9nigp1gq2mp3j94qq14.apps.googleusercontent.com",
    offlineAccess: true,
});

export const signInWithGoogle = async () => {
    try {
        await GoogleSignin.hasPlayServices();
        const userInfo = await GoogleSignin.signIn();
        // userInfo.idToken is what we need for the backend
        return userInfo;
    } catch (error: any) {
        if (error.code === statusCodes.SIGN_IN_CANCELLED) {
            console.log("User cancelled the login flow");
        } else if (error.code === statusCodes.IN_PROGRESS) {
            console.log("Signing in progress");
        } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
            console.log("Play services not available or outdated");
        } else {
            console.error("Google login error:", error);
        }
        throw error;
    }
};

export const signOutCurrentUser = async () => {
    try {
        await GoogleSignin.signOut();
    } catch (error) {
        console.error("Google sign out error:", error);
        throw error;
    }
};

// Mock versions of other services mentioned in user's original code
export const signInWithFacebook = async () => { throw new Error("Facebook login not implemented"); };
export const signInWithTwitter = async () => { throw new Error("Twitter login not implemented"); };
export const observeAuthState = (callback: (user: any) => void) => {
    // This is usually handled by Firebase, but since we are just doing Google Sign In + Backend, 
    // we might not need a persistent listener here if the store handles it.
    return () => { };
};
