import React, { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";

const Profile = () => {
    const [profile, setProfile] = useState({
        name: "",
        address: "",
        phone: "",
        email: "",
        image: null,
    });
    const [imagePreview, setImagePreview] = useState(null);
    const [hasProfile, setHasProfile] = useState(false);
    const [hospitalId, setHospitalId] = useState(null);

    const apiURL = "http://localhost:5000/api";
    const userId = localStorage.getItem("user_id"); // make sure user_id is stored

    // Fetch hospital_id first
    const fetchHospitalId = async () => {
        if (!userId) return;
        try {
            const res = await fetch(`${apiURL}/fetch_hospital_id/${userId}`);
            const data = await res.json();

            if (res.ok && data.hospital_id) {
                setHospitalId(data.hospital_id);
            } else {
                console.error(data.error || "Hospital not found for this user");
                toast.error(data.error || "Hospital not found for this user");
            }
        } catch (err) {
            console.error("Error fetching hospital_id:", err);
            toast.error("Failed to fetch hospital ID");
        }
    };

    // Fetch profile based on user_id
    const fetchProfile = async () => {
        if (!userId) return;

        try {
            const res = await fetch(`${apiURL}/hospital_profile/${userId}`);
            if (!res.ok) throw new Error("Failed to fetch profile");
            const data = await res.json();

            if (data) {
                setProfile({
                    name: data.name,
                    address: data.address,
                    phone: data.phone,
                    email: data.email,
                    image: null, // keep file input empty
                });
                if (data.image) setImagePreview(data.image);
                setHospitalId(data.hospital_id); // set hospital ID
                setHasProfile(true);
            }
        } catch (err) {
            console.error(err);
            toast.error(err.message);
        }
    };

    // On mount, fetch profile directly
    useEffect(() => {
        fetchProfile();
    }, [userId]);

    // On mount, fetch hospital_id
    useEffect(() => {
        fetchHospitalId();
    }, [userId]);



    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfile((prev) => ({ ...prev, image: file }));
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleAddOrUpdate = async () => {
        if (!profile.name || !profile.address || !profile.phone || !profile.email) {
            toast.error("All fields are required");
            return;
        }

        if (!userId) {
            toast.error("User not logged in");
            return;
        }

        const formData = new FormData();
        formData.append("name", profile.name);
        formData.append("address", profile.address);
        formData.append("phone", profile.phone);
        formData.append("email", profile.email);
        formData.append("user_id", userId); // <-- important
        if (profile.image) formData.append("image", profile.image);

        try {
            const method = hasProfile ? "PUT" : "POST";
            const url = hasProfile ? `${apiURL}/hospitals/${hospitalId}` : `${apiURL}/hospitals`;

            const res = await fetch(url, {
                method,
                body: formData,
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to save profile");

            toast.success(hasProfile ? "Profile updated!" : "Profile added!");
            setHasProfile(true);

            // **Set the new hospital ID immediately**
            if (!hasProfile && data.hospital_id) {
                setHospitalId(data.hospital_id); // <-- important
            }

            if (data.image) setImagePreview(data.image);
        } catch (err) {
            console.error(err);
            toast.error(err.message || "Failed to save profile");
        }
    };


    const handleDelete = async () => {
        if (!hospitalId) return;

        if (!window.confirm("Are you sure you want to delete the profile?")) return;

        try {
            const res = await fetch(`${apiURL}//${hospitalId}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Failed to delete profile");

            setProfile({ name: "", address: "", phone: "", email: "", image: null });
            setImagePreview(null);
            setHasProfile(false);
            toast.success("Profile deleted successfully");
        } catch (err) {
            console.error(err);
            toast.error(err.message || "Failed to delete profile");
        }
    };

    return (
        <div className="max-w-xl mx-auto bg-white p-6 rounded shadow">
            <Toaster position="top-right" />
            <h2 className="text-2xl font-bold mb-4">
                {hasProfile ? "Update Hospital Profile" : "Add Hospital Profile"}
            </h2>
            <div className="space-y-4">
                <div>
                    <label className="block font-semibold mb-1">Name</label>
                    <input
                        type="text"
                        name="name"
                        value={profile.name}
                        onChange={handleChange}
                        className="w-full border px-3 py-2 rounded"
                    />
                </div>
                <div>
                    <label className="block font-semibold mb-1">Address</label>
                    <input
                        type="text"
                        name="address"
                        value={profile.address}
                        onChange={handleChange}
                        className="w-full border px-3 py-2 rounded"
                    />
                </div>
                <div>
                    <label className="block font-semibold mb-1">Phone</label>
                    <input
                        type="text"
                        name="phone"
                        value={profile.phone}
                        onChange={handleChange}
                        className="w-full border px-3 py-2 rounded"
                    />
                </div>
                <div>
                    <label className="block font-semibold mb-1">Email</label>
                    <input
                        type="email"
                        name="email"
                        value={profile.email}
                        onChange={handleChange}
                        className="w-full border px-3 py-2 rounded"
                    />
                </div>
                <div>
                    <label className="block font-semibold mb-1">Image</label>
                    <input type="file" onChange={handleImageChange} />
                    {imagePreview && (
                        <img
                            src={imagePreview}
                            alt="Preview"
                            className="mt-2 w-32 h-32 object-cover rounded border"
                        />
                    )}
                </div>
                <div className="flex gap-2 mt-4">
                    <button
                        onClick={handleAddOrUpdate}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                    >
                        {hasProfile ? "Update" : "Add Hospital"}
                    </button>
                    {hasProfile && (
                        <button
                            onClick={handleDelete}
                            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                        >
                            Delete
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
