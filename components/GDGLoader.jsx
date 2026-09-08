import React from "react";

const DWASFWLoader = () => {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
      <span className="h-10 w-10 animate-spin rounded-full border-2 border-muted border-t-primary" />
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  );
};

export default DWASFWLoader;
