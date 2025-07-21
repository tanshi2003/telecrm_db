import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Select from "react-select";
import ClipLoader from "react-spinners/ClipLoader";
import Sidebar from "../components/Sidebar";
import { FaPlus } from "react-icons/fa";

const roleOptions = [
  { label: "Manager", value: "manager" },
  { label: "Employee", value: "employee" },
];

const fieldWorkOptions = [
  { label: "Field Work", value: "field" },
  { label: "Desk Job", value: "desk" },
];

const statusOptions = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

const RegisterUser = () => {
  const [admin, setAdmin] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm();

  const selectedRole = watch("role")?.value;

  useEffect(() => {
    const storedAdmin = JSON.parse(localStorage.getItem("user"));
    if (storedAdmin) setAdmin(storedAdmin);
  }, []);

  const onSubmit = async (data) => {
    const payload = {
      userName: data.userName,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phoneNumber: data.phoneNumber,
      password: data.password,
      role: data.role.value,
      status: data.status.value,
      fieldWorkType: data.role.value === "employee" ? data.fieldWorkType?.value : "",
      workingHours: data.workingHours,
      location: data.location,
    };

    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/addUser`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (result.success) {
        toast.success("✅ User registered successfully!");
        reset();
        setShowForm(false);
        setTimeout(() => navigate("/admin/users"), 1500);
      } else {
        toast.error("❌ Failed to register user.");
      }
    } catch (err) {
      toast.error("❌ Error connecting to server.");
    }
  };

  return (
    <div className="relative flex min-h-screen">
      <Sidebar user={admin} />

      <div className="flex-grow bg-gray-100 p-6 ml-64 mt-16">
        <div className="max-w-5xl mx-auto">
          {/* Header + Button */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">User Registration</h2>
            <button
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              onClick={() => setShowForm((prev) => !prev)}
            >
              <FaPlus /> {showForm ? "Close Form" : "Add User"}
            </button>
          </div>

          {/* Collapsible Form */}
          {showForm && (
            <div className="bg-white p-6 rounded-md shadow-md transition-all duration-300 border border-gray-200">
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {/* Username + First Name Group */}
                <div>
                  <label className="block text-sm font-medium">Username *</label>
                  <input
                    {...register("userName", { required: "Username is required" })}
                    className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your username"
                  />
                  {errors.userName && (
                    <p className="text-red-500 text-sm">{errors.userName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium">First Name *</label>
                  <input
                    {...register("firstName", { required: "First name is required" })}
                    className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your first name"
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-sm">{errors.firstName.message}</p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-medium">Last Name</label>
                  <input
                    {...register("lastName")}
                    className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your last name"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium">Email *</label>
                  <input
                    type="email"
                    {...register("email", { required: "Email is required" })}
                    className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your email"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm">{errors.email.message}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium">Phone Number *</label>
                  <input
                    type="tel"
                    {...register("phoneNumber", { required: "Phone number is required" })}
                    className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your phone number"
                  />
                  {errors.phoneNumber && (
                    <p className="text-red-500 text-sm">{errors.phoneNumber.message}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium">Password *</label>
                  <input
                    type="password"
                    {...register("password", { required: "Password is required" })}
                    className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your password"
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium">Role *</label>
                  <Controller
                    name="role"
                    control={control}
                    rules={{ required: "Role is required" }}
                    render={({ field }) => (
                      <Select {...field} options={roleOptions} placeholder="Select Role" />
                    )}
                  />
                  {errors.role && (
                    <p className="text-red-500 text-sm">{errors.role.message}</p>
                  )}
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium">Status *</label>
                  <Controller
                    name="status"
                    control={control}
                    rules={{ required: "Status is required" }}
                    render={({ field }) => (
                      <Select {...field} options={statusOptions} placeholder="Select Status" />
                    )}
                  />
                  {errors.status && (
                    <p className="text-red-500 text-sm">{errors.status.message}</p>
                  )}
                </div>

                {/* Field Work Type */}
                {selectedRole === "employee" && (
                  <div>
                    <label className="block text-sm font-medium">Field Work Type *</label>
                    <Controller
                      name="fieldWorkType"
                      control={control}
                      rules={{ required: "Field work type is required" }}
                      render={({ field }) => (
                        <Select {...field} options={fieldWorkOptions} placeholder="Select Work Type" />
                      )}
                    />
                    {errors.fieldWorkType && (
                      <p className="text-red-500 text-sm">{errors.fieldWorkType.message}</p>
                    )}
                  </div>
                )}

                {/* Working Hours */}
                <div>
                  <label className="block text-sm font-medium">Working Hours</label>
                  <input
                    {...register("workingHours")}
                    className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter working hours"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium">Location</label>
                  <input
                    {...register("location")}
                    className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter location"
                  />
                </div>

                {/* Submit Button */}
                <div className="md:col-span-2">
                  <button
                    type="submit"
                    className="btn btn-primary w-full mt-4 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? <ClipLoader size={20} color="#fff" /> : "Register User"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterUser;


