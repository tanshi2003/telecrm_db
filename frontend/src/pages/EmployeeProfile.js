import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import toast from "react-hot-toast";
import ClipLoader from "react-spinners/ClipLoader";
import Sidebar from "../components/Sidebar";

const roleOptions = [
  { label: "Manager", value: "manager" },
  { label: "Employee", value: "employee" },
];

const statusOptions = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Suspended", value: "suspended" },
];

const fieldWorkOptions = [
  { label: "Field Work", value: "field" },
  { label: "Desk Job", value: "desk" },
];

const tabs = ["Profile", "Activity Logs", "Notes"];

const EmployeeProfile = () => {
  const { userId } = useParams();
  const [admin, setAdmin] = useState(null);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("Profile");

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { isSubmitting },
  } = useForm();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) setAdmin(storedUser);

    const fetchUser = async () => {
      try {
        const res = await fetch(`http://localhost:5000/user/${userId}`);
        const data = await res.json();
        if (data.success) {
          setUser(data.user);
          reset({
            userName: data.user.userName,
            email: data.user.email,
            phoneNumber: data.user.phoneNumber,
            role: { label: capitalize(data.user.role), value: data.user.role },
            status: { label: capitalize(data.user.status), value: data.user.status },
            fieldWorkType: data.user.fieldWorkType
              ? {
                  label: capitalize(data.user.fieldWorkType),
                  value: data.user.fieldWorkType,
                }
              : null,
            location: data.user.location,
            workingHours: data.user.workingHours,
          });
        } else {
          toast.error("User not found.");
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch user.");
      }
    };

    fetchUser();
  }, [userId, reset]);

  const onSubmit = async (data) => {
    const updatedData = {
      userName: data.userName,
      email: data.email,
      phoneNumber: data.phoneNumber,
      role: data.role.value,
      status: data.status.value,
      fieldWorkType: data.role.value === "employee" ? data.fieldWorkType?.value : "",
      location: data.location,
      workingHours: data.workingHours,
    };

    try {
      const res = await fetch(`http://localhost:5000/updateUser/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      const result = await res.json();
      if (result.success) {
        toast.success("✅ Profile updated successfully.");
      } else {
        toast.error("❌ Update failed.");
      }
    } catch (err) {
      toast.error("❌ Server error.");
    }
  };

  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  return (
    <div className="relative flex min-h-screen">
      <Sidebar user={admin} />

      <main className="flex-grow bg-gray-100 p-6 ml-64 mt-16">
        <div className="max-w-7xl mx-auto bg-white rounded-md shadow-md p-6">
          <h2 className="text-2xl font-bold mb-6">
            🧑‍💼 Employee Profile: {user?.userName || "Loading..."}
          </h2>

          {/* Tabs */}
          <div className="flex space-x-6 border-b mb-6">
            {tabs.map((tab) => (
              <button
                key={tab}
                className={`py-2 px-4 text-sm font-medium ${
                  activeTab === tab
                    ? "border-b-2 border-blue-600 text-blue-700"
                    : "text-gray-600"
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {!user ? (
            <div className="text-center py-10 text-gray-500">Loading user...</div>
          ) : (
            <>
              {/* Profile Tab */}
              {activeTab === "Profile" && (
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  <div>
                    <label className="text-sm font-medium">Username</label>
                    <input
                      {...register("userName")}
                      className="input input-bordered w-full mt-1"
                      disabled
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <input {...register("email")} className="input input-bordered w-full mt-1" />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Phone Number</label>
                    <input
                      {...register("phoneNumber")}
                      className="input input-bordered w-full mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Role</label>
                    <Controller
                      name="role"
                      control={control}
                      render={({ field }) => (
                        <Select {...field} options={roleOptions} placeholder="Select Role" />
                      )}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <Controller
                      name="status"
                      control={control}
                      render={({ field }) => (
                        <Select {...field} options={statusOptions} placeholder="Select Status" />
                      )}
                    />
                  </div>

                  {user.role === "employee" && (
                    <div>
                      <label className="text-sm font-medium">Field Work Type</label>
                      <Controller
                        name="fieldWorkType"
                        control={control}
                        render={({ field }) => (
                          <Select
                            {...field}
                            options={fieldWorkOptions}
                            placeholder="Work Type"
                          />
                        )}
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium">Location</label>
                    <input {...register("location")} className="input input-bordered w-full mt-1" />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Working Hours</label>
                    <input
                      {...register("workingHours")}
                      className="input input-bordered w-full mt-1"
                    />
                  </div>

                  <div className="col-span-2">
                    <button
                      type="submit"
                      className="btn btn-primary w-full mt-4 flex items-center justify-center"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? <ClipLoader size={20} color="#fff" /> : "Save Changes"}
                    </button>
                  </div>
                </form>
              )}

              {/* Activity Logs Tab */}
              {activeTab === "Activity Logs" && (
                <div className="p-2">
                  <h3 className="text-lg font-semibold mb-2">Recent Activity</h3>
                  <ul className="space-y-2 text-sm">
                    <li>🕒 2025-05-10 - Logged in</li>
                    <li>📝 2025-05-08 - Updated phone number</li>
                    <li>🔒 2025-05-01 - Password changed</li>
                  </ul>
                </div>
              )}

              {/* Notes Tab */}
              {activeTab === "Notes" && (
                <div className="p-2">
                  <h3 className="text-lg font-semibold mb-2">Manager Notes</h3>
                  <textarea
                    className="textarea textarea-bordered w-full h-32"
                    placeholder="Add notes here..."
                  />
                  <button className="btn btn-secondary mt-3">Save Note</button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default EmployeeProfile;
