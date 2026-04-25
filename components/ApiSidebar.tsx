"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { AddApiModal } from "./AddApiModal";
import { ConfirmModal } from "./ConfirmModal";
import { toastService } from "@/services";

interface Api {
  id: string;
  name: string;
  url: string;
}

export function ApiSidebar({ onApisChange, initialApis }: { onApisChange: (apis: Api[]) => void; initialApis?: Api[] }) {
  const [apis, setApis] = useState<Api[]>(initialApis || []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApi, setEditingApi] = useState<Api | null>(null);
  const [deletingApi, setDeletingApi] = useState<Api | null>(null);

  useEffect(() => {
    onApisChange(apis);
  }, [apis]);

  const handleAddApi = (api: { name: string; url: string }) => {
    if (editingApi) {
      setApis(apis.map(a => a.id === editingApi.id ? { ...a, ...api } : a));
      setEditingApi(null);
    } else {
      const newApi = {
        id: Date.now().toString(),
        ...api,
      };
      setApis([...apis, newApi]);
    }
  };

  const handleEdit = (api: Api) => {
    setEditingApi(api);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setApis(apis.filter(api => api.id !== id));
    setDeletingApi(null);
    toastService.deleted('API removed successfully');
  };

  return (
    <>
      <aside className="w-80 bg-black border-r border-zinc-800 flex flex-col">
        <div className="p-2 border-b border-zinc-800">
          <Button 
            className="w-full bg-white text-black hover:bg-zinc-200"
            onClick={() => {
              setEditingApi(null);
              setIsModalOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            New API
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <div className="p-2 border-zinc-900 border-b">
            {apis.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <div className="relative mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-indigo-500/30">
                    <Plus className="w-8 h-8 text-indigo-400" />
                  </div>
                </div>
                <h3 className="text-base font-semibold text-zinc-200 mb-2">No API Sources</h3>
                <p className="text-sm text-zinc-400 mb-4 max-w-[200px]">
                  Add your first API source to start transforming data
                </p>
                <button
                  onClick={() => {
                    setEditingApi(null);
                    setIsModalOpen(true);
                  }}
                  className="text-sm text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add API Source
                </button>
              </div>
            ) : (
              apis.map((api) => (
                <div
                  key={api.id}
                  className="group relative p-3 rounded-md hover:bg-zinc-800 transition-colors mb-1"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-green-500">GET</span>
                    <span className="text-sm text-zinc-300 truncate flex-1">{api.name}</span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(api)}
                        className="p-1 hover:bg-zinc-700 rounded"
                      >
                        <Pencil className="w-3 h-3 text-zinc-400" />
                      </button>
                      <button
                        onClick={() => setDeletingApi(api)}
                        className="p-1 hover:bg-zinc-700 rounded"
                      >
                        <Trash2 className="w-3 h-3 text-red-400" />
                      </button>
                    </div>
                  </div>
                  <div className="text-xs text-zinc-500 truncate">{api.url}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </aside>

      <AddApiModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingApi(null);
        }}
        onAdd={handleAddApi}
        editingApi={editingApi}
      />

      <ConfirmModal
        isOpen={!!deletingApi}
        onClose={() => setDeletingApi(null)}
        onConfirm={() => deletingApi && handleDelete(deletingApi.id)}
        title="Delete API"
        message={`Are you sure you want to delete "${deletingApi?.name}"? This action cannot be undone.`}
      />
    </>
  );
}
