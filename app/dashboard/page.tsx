"use client";

import { useState } from "react";
import { ApiSidebar } from "@/components/ApiSidebar";
import { TransformWorkspace } from "@/components/TransformWorkspace";

interface Api {
  id: string;
  name: string;
  url: string;
}

export default function Dashboard() {
  const [apis, setApis] = useState<Api[]>([]);

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-[#0B0F17] mt-16">
      <ApiSidebar onApisChange={setApis} />
      <TransformWorkspace apis={apis} />
    </div>
  );
}