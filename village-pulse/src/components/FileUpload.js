// src/components/FileUpload.js
import React, { useState } from "react";
import { storage } from "../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function FileUpload({ reportId, onUpload }) {
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");

  async function handleUpload() {
    if (!file) return;
    const imageRef = ref(storage, `reports/${reportId}/${file.name}`);
    await uploadBytes(imageRef, file);
    const url = await getDownloadURL(imageRef);
    setImageUrl(url);
    onUpload(url); // send url to backend with report form
  }

  return (
    <div>
      <input type="file" onChange={e => setFile(e.target.files[0])} />
      <button type="button" onClick={handleUpload}>Upload</button>
      {imageUrl && (
        <div>
          <img src={imageUrl} alt="Uploaded" style={{width:200}} />
          <p>URL: {imageUrl}</p>
        </div>
      )}
    </div>
  );
}