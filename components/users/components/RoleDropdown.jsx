import React from "react";
import Dropdown from "@/components/ui/dropdown";
import { Loader2 } from "lucide-react";

const RoleList = ({ roles, selectedRole, onSelect }) => (
  <div className="w-full">
    {roles?.map((role) => (
      <div
        key={role.id}
        onClick={() => onSelect?.(role.id)}
        className={`flex items-center gap-2 px-[11px] py-[5px] rounded-[6px] w-full cursor-pointer transition-colors ${
          selectedRole === role.id ? "bg-[#F8FAFC]" : "bg-white hover:bg-[#F8FAFC]"
        }`}
      >
        <div className="font-['Inter:Medium',_sans-serif] font-medium text-[14px] text-slate-600">{role.name}</div>
      </div>
    ))}
  </div>
);

const RoleDropdown = ({ roles, rolesLoading, value, error, touched, focused, onOpenChange, onSelect }) => {
  const selectedRoleName = value ? roles.find((r) => r.id === value)?.name || "Select role" : "";

  return (
    <Dropdown
      align="left"
      placeholder="Select role"
      value={selectedRoleName}
      error={touched && error}
      focused={focused}
      disabled={rolesLoading}
      loading={rolesLoading}
      onOpenChange={onOpenChange}
      onSelect={onSelect}
    >
      {rolesLoading ? (
        <div className="flex items-center justify-center py-4 px-3">
          <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
          <span className="ml-2 text-sm text-slate-500">Loading...</span>
        </div>
      ) : roles.length > 0 ? (
        <RoleList roles={roles} selectedRole={value} onSelect={onSelect} />
      ) : (
        <div className="px-3 py-2 text-sm text-slate-500">No roles available</div>
      )}
    </Dropdown>
  );
};

export default RoleDropdown;
