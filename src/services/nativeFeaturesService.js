// Native Features Service - Haptics, Share, Status Bar
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Share } from '@capacitor/share';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';

// Haptic Feedback
export const vibrate = async (style = 'medium') => {
  try {
    const styles = {
      light: ImpactStyle.Light,
      medium: ImpactStyle.Medium,
      heavy: ImpactStyle.Heavy
    };
    
    await Haptics.impact({ style: styles[style] || ImpactStyle.Medium });
  } catch (error) {
    console.error('Haptic error:', error);
  }
};

export const vibrateSuccess = async () => {
  await Haptics.notification({ type: 'SUCCESS' });
};

export const vibrateWarning = async () => {
  await Haptics.notification({ type: 'WARNING' });
};

export const vibrateError = async () => {
  await Haptics.notification({ type: 'ERROR' });
};

// Share progress
export const shareProgress = async (text, title = 'My Helio Progress') => {
  try {
    await Share.share({
      title,
      text,
      dialogTitle: 'Share your progress'
    });
  } catch (error) {
    console.error('Share error:', error);
  }
};

export const shareProgressWithImage = async (imageUrl, text) => {
  try {
    await Share.share({
      title: 'My Helio Progress',
      text,
      url: imageUrl,
      dialogTitle: 'Share your achievement'
    });
  } catch (error) {
    console.error('Share error:', error);
  }
};

// Status Bar
export const setStatusBarLight = async () => {
  try {
    await StatusBar.setStyle({ style: Style.Light });
  } catch (error) {
    console.error('Status bar error:', error);
  }
};

export const setStatusBarDark = async () => {
  try {
    await StatusBar.setStyle({ style: Style.Dark });
  } catch (error) {
    console.error('Status bar error:', error);
  }
};

export const hideStatusBar = async () => {
  try {
    await StatusBar.hide();
  } catch (error) {
    console.error('Status bar error:', error);
  }
};

export const showStatusBar = async () => {
  try {
    await StatusBar.show();
  } catch (error) {
    console.error('Status bar error:', error);
  }
};

// Splash Screen
export const hideSplashScreen = async () => {
  try {
    await SplashScreen.hide();
  } catch (error) {
    console.error('Splash screen error:', error);
  }
};

export const showSplashScreen = async () => {
  try {
    await SplashScreen.show();
  } catch (error) {
    console.error('Splash screen error:', error);
  }
};
