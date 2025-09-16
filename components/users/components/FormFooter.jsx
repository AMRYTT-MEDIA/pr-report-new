import React from "react";
import { X, Check, Loader2, CircleXIcon, CircleCheckBig } from "lucide-react";
import Loading from "@/components/ui/loading";
import { Button } from "@/components/ui/button";

const FormFooter = ({
  loading,
  isValid,
  dirty,
  isEdit,
  onCancel,
  onSubmit,
}) => {
  return (
    <div className="flex items-center justify-end gap-2.5">
      <Button
        variant="default"
        onClick={onCancel}
        className="gap-1.5 px-4 py-2.5 bg-white hover:bg-white-20 text-gray-scale-60 hover:text-primary-60 rounded-3xl font-semibold w-full sm:w-auto"
      >
        <CircleXIcon className="h-4 w-4" />
        Cancel
      </Button>
      <Button
        variant="default"
        onClick={onSubmit}
        disabled={loading || !isValid || !dirty}
        className="gap-1.5 px-4 py-2.5 bg-primary-50 hover:bg-primary-60 text-white rounded-3xl font-semibold w-full sm:w-auto"
      >
        {loading ? (
          <>
            <Loading size="sm" color="white" className="w-4 h-4 animate-spin" />
            {isEdit ? "Updating..." : "Creating..."}
          </>
        ) : (
          <>
            <CircleCheckBig className="h-4 w-4" />
            {isEdit ? "Update" : "Create"}
          </>
        )}
      </Button>
    </div>
  );
};

export default FormFooter;
