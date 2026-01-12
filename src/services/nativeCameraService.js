// Native Camera Service using Capacitor
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

// Take photo for progress tracking
export const takeProgressPhoto = async () => {
  try {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera,
      saveToGallery: true
    });
    
    return {
      dataUrl: image.dataUrl,
      format: image.format,
      path: image.path
    };
  } catch (error) {
    console.error('Camera error:', error);
    throw error;
  }
};

// Take photo for food scanning
export const takeFoodPhoto = async () => {
  try {
    const image = await Camera.getPhoto({
      quality: 80,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera,
      saveToGallery: false
    });
    
    return {
      dataUrl: image.dataUrl,
      format: image.format
    };
  } catch (error) {
    console.error('Camera error:', error);
    throw error;
  }
};

// Pick multiple photos from gallery
export const pickPhotosFromGallery = async () => {
  try {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Photos
    });
    
    return {
      dataUrl: image.dataUrl,
      format: image.format,
      path: image.path
    };
  } catch (error) {
    console.error('Gallery error:', error);
    throw error;
  }
};

// Convert DataUrl to File for Gemini API
export const dataUrlToFile = async (dataUrl, filename = 'photo.jpg') => {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  return new File([blob], filename, { type: blob.type });
};
