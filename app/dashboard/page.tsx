"use client";

import { useState, useEffect } from "react";
import { ApiSidebar } from "@/components/ApiSidebar";
import { TransformWorkspace } from "@/components/TransformWorkspace";
import { Plus, Rocket, Calendar, Edit, Trash2 } from "lucide-react";
import { configService, type TransformConfig, type Api, toastService } from "@/services";
import { config as appConfig } from "@/lib/config";

export default function Dashboard() {
  const [apis, setApis] = useState<Api[]>([]);
  const [showWorkspace, setShowWorkspace] = useState(false);
  const [savedConfigs, setSavedConfigs] = useState<TransformConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingConfig, setEditingConfig] = useState<TransformConfig | null>(null);

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      const data = await configService.getAllConfigs();
      setSavedConfigs(data || []);
    } catch (error) {
      toastService.error('Failed to fetch configurations');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    toastService.promise(
      configService.deleteConfig(id),
      {
        loading: 'Deleting transformation...',
        success: 'Transformation deleted successfully',
        error: 'Failed to delete transformation',
      }
    ).then(() => {
      setSavedConfigs(prev => prev.filter(c => c.id !== id));
    });
  };

  const handleEdit = (config: TransformConfig) => {
    setEditingConfig(config);
    setApis(config.apis || []);
    setShowWorkspace(true);
  };

  const handleBack = () => {
    setShowWorkspace(false);
    setEditingConfig(null);
    setApis([]);
  };

  if (showWorkspace) {
    return (
      <div className="flex h-[calc(100vh-4rem)] bg-[#0B0F17] mt-16">
        <ApiSidebar onApisChange={setApis} initialApis={apis} />
        <TransformWorkspace 
          apis={apis} 
          onBack={handleBack}
          initialConfig={editingConfig}
        />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#0B0F17] mt-16 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-zinc-100">Saved Transformations</h1>
            <p className="text-zinc-400 mt-2">Manage your API transformation configurations</p>
          </div>
          <button
            onClick={() => setShowWorkspace(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-medium"
          >
            <Plus className="w-5 h-5" />
            Create New
          </button>
        </div>

        {loading ? (
          <div className="text-zinc-400 text-center py-12">Loading...</div>
        ) : savedConfigs.length === 0 ? (
          <div className="text-center py-12">
            <Rocket className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-zinc-300 mb-2">No transformations yet</h3>
            <p className="text-zinc-500 mb-6">Create your first API transformation to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedConfigs.map((config) => (
              <div
                key={config.id}
                className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-indigo-500 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Rocket className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-lg font-semibold text-zinc-100">{config.name}</h3>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(config)}
                      className="text-zinc-400 hover:text-indigo-400 p-1"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(config.id!)}
                      className="text-zinc-400 hover:text-red-400 p-1"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="text-sm text-zinc-400">
                    <span className="font-medium">{config.apis?.length || 0}</span> API source{config.apis?.length !== 1 ? 's' : ''}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <Calendar className="w-3 h-3" />
                    {config.createdAt && new Date(config.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-800">
                  <a
                    href={`${appConfig.publicBackendUrl}/api/transform/${config.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-indigo-400 hover:text-indigo-300 font-mono break-all"
                  >
                    {appConfig.publicBackendUrl}/api/transform/{config.id}
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}