import React, { useState, useEffect } from "react";
import FormField from "./FormField";
import DropdownV2 from "@/components/ui/dropdown-v2";
import PasswordField from "./PasswordField";
import ErrorMessage from "@/components/ui/error-message";

const UserForm = ({
  formik,
  isEdit,
  roles,
  rolesLoading,
  showPassword,
  setShowPassword,
  open,
}) => {
  const [roleTouched, setRoleTouched] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  // Reset roleTouched when dialog opens
  useEffect(() => {
    if (open) {
      setRoleTouched(false);
      setRoleDropdownOpen(false);
    }
  }, [open]);

  // Custom handlers for role field
  const handleRoleFocus = () => {
    setRoleTouched(true);
    if (formik.handleFocus) {
      formik.handleFocus({ target: { name: "role" } });
    }
  };

  const handleRoleBlur = () => {
    if (formik.handleBlur) {
      formik.handleBlur({ target: { name: "role" } });
    }
  };

  const handleRoleOpenChange = (isOpen) => {
    setRoleDropdownOpen(isOpen);
  };
  return (
    <form onSubmit={formik.handleSubmit} className="flex flex-col gap-5">
      {/* Hidden fake fields to prevent autofill */}
      <input
        type="text"
        name="fake-username"
        style={{ display: "none" }}
        autoComplete="username"
      />
      <input
        type="password"
        name="fake-password"
        style={{ display: "none" }}
        autoComplete="current-password"
      />
      {/* First Row - User Name and Role */}
      <div className="flex flex-col md:flex-row gap-[15px] w-full">
        {/* User Name Field */}
        <div className="w-full md:flex-1">
          <FormField
            name="fullName"
            label="User Name"
            placeholder="Enter user name"
            required
            value={formik.values.fullName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.errors.fullName}
            touched={formik.touched.fullName}
          />
        </div>

        {/* Role Field */}
        <div className="w-full md:flex-1">
          <div className="space-y-3">
            <label className="text-slate-600">
              Role <span className="text-danger-scale-60">*</span>
            </label>
            <DropdownV2
              name="role"
              options={roles.map((role) => ({
                value: role.id,
                label: role.name,
              }))}
              value={formik.values.role}
              placeholder="Select role"
              disabled={rolesLoading}
              loading={rolesLoading}
              error={roleTouched && formik.errors.role}
              touched={roleTouched}
              onChange={formik.handleChange}
              onBlur={handleRoleBlur}
              onFocus={handleRoleFocus}
              onOpenChange={handleRoleOpenChange}
            />
          </div>
          <ErrorMessage
            message={
              roleTouched && formik.errors.role && !roleDropdownOpen
                ? formik.errors.role
                : null
            }
            className="mt-1.5"
          />
        </div>
      </div>

      {/* Second Row - Email Field (Full Width) */}
      <div className="w-full">
        <FormField
          name="email"
          label="Email"
          type="email"
          placeholder="Enter Email Address"
          required={!isEdit}
          readOnly={isEdit}
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.errors.email}
          touched={formik.touched.email}
        />
      </div>

      {/* Password Field (only for new users) */}
      {!isEdit && (
        <PasswordField
          name="password"
          value={formik.values.password}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.errors.password}
          touched={formik.touched.password}
          showPassword={showPassword}
          onTogglePassword={() => setShowPassword(!showPassword)}
        />
      )}
    </form>
  );
};

export default UserForm;
