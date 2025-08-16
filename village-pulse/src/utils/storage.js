// src/utils/storage.js
import { storage } from "../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

/**
 * Uploads an image file to Firebase Storage and returns its download URL
 * @param {File} file - File object to upload
 * @param {string} path - Path in Firebase Storage (e.g. 'images/photo.jpg')
 * @returns {Promise<string>} - Download URL of the uploaded file
 * @throws Will throw on upload or retrieval failure
 */
export async function uploadImage(file, path) {
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const url = await getDownloadURL(snapshot.ref);
    return url;
  } catch (err) {
    console.error("Image upload failed:", err);
    throw err;
  }
}
