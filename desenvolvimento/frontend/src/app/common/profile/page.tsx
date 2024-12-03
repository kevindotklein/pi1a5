"use client"

import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/user";
import { auth, firestore, storage } from "@/firebase/config";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { t } from "i18next";
import { useState } from "react";

export default function Profile() {
  const { logout, userData } = useAuth() as any;
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [full_name, setfull_name] = useState<string>(userData?.full_name || "");
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);


  const displayEducationLevel = (education: string) => {
    switch(education) {
      case "ensino-fundamental":
        return t("profile.elementary-education");
      case "ensino-medio":
        return t("profile.high-school");
      case "ensino-superior":
        return t("profile.college");
    }
  }

  const displayPlan = (plan: string) => {
    switch(plan) {
      case "free":
        return t("profile.free");
      case "paid":
        return "Premium";
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedImage(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setUploadedImage(file); 
    }
  };

  const preventDefault = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();

  const toggleModal = () => setIsModalOpen(!isModalOpen);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    toggleModal();
    console.log("userData: ", userData);
    const userId = auth.currentUser?.uid;

    try {
      const userDocRef = doc(firestore, "users", userId as string);
      await updateDoc(userDocRef, {full_name});
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: t("profile.error"),
        description: t("profile.update-name-fail") + error.message,
      });
    }

    if(!uploadedImage) return;

    const fileName = (Math.random() + 1).toString(36).substring(7);
    
    const storageRef = ref(storage, `users/${fileName}`);
    const uploadUser = uploadBytesResumable(storageRef, uploadedImage);

    uploadUser.on(
      "state_changed",
      (snapshot: any) => {
        const progress = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
      },
      (error: any) => {
        toast({
          variant: "destructive",
          title: t("notice-upload.error"),
          description: error.message,
        });
      },
      async () => {
        const url = await getDownloadURL(uploadUser.snapshot.ref);
        try {
          const userDocRef = doc(firestore, "users", userId as string);
          await updateDoc(userDocRef, {url});

        } catch (error: any) {
          toast({
            variant: "destructive",
            title: t("profile.error"),
            description: t("profile.update-image-fail") + error.message,
          });
        }
      }
    )

    setUploadedImage(null);
  }

  return (
    <>
      <div className="bg-slate-100 rounded-lg shadow-lg p-6 w-[900px] mx-auto flex justify-start">
        <div className="w-64 h-42 rounded-full bg-slate-300 flex items-center justify-center overflow-hidden">
          <img
            src={userData?.url || "https://picsum.photos/201"}
            alt="Profile"
            className="rounded-full w-full h-full object-cover"
          />
        </div>

        <div className="ml-14 w-3/4">
          <header className="flex w-full items-center mb-3 space-x-4">
            <h2 className="text-2xl font-bold text-gray-800">{userData?.full_name}</h2>
            <span className="text-slate-500 ml-10">{userData?.email}</span>
            <button className="bg-blue-600 text-white p-2 rounded-3xl px-4 font-bold" onClick={toggleModal}>Editar</button>
          </header>
          <span className="text-slate-500 text-sm">CPF:</span>
          <p className="text-black mb-2">{userData?.document}</p>
          <span className="text-slate-500 text-sm">{t("profile.education-level")}</span>
          <p className="text-black mb-2">{displayEducationLevel(userData?.education_level)}</p>
          <span className="text-slate-500 text-sm">{t("profile.plan")}</span>
          <p className="text-black">{displayPlan(userData?.plan)}</p>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-[550px] shadow-lg">
            <h2 className="text-lg font-bold mb-4">{t("profile.edit-profile")}</h2>
            <form>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">{t("profile.name")}</label>
                <input
                  type="text"
                  value={full_name}
                  onChange={(e) => setfull_name(e.target.value)}
                  className="w-full border rounded-md p-2"
                />
              </div>
              <div
                className="border-dashed border-2 border-gray-300 p-4 rounded-md flex items-center justify-center mb-4 cursor-pointer"
                onDrop={handleDrop}
                onDragOver={preventDefault}
              >
                {uploadedImage ? (
                  <img
                    src={URL.createObjectURL(uploadedImage)} 
                    alt="Uploaded"
                    className="h-24 w-24 object-cover rounded-full"
                  />
                ) : (
                  <label className="cursor-pointer">
                    {t("profile.select-image")}
                    <input type="file" className="hidden" onChange={handleImageUpload} />
                  </label>
                )}
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={toggleModal}
                  className="bg-slate-600 text-white p-2 rounded-3xl mr-2 px-4"
                >
                  {t("profile.cancel-button")}
                </button>
                <button
                  className="bg-blue-600 text-white p-2 rounded-3xl px-4"
                  onClick={handleSubmit}
                >
                  {t("profile.save-button")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </>
  );
}
  