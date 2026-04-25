"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Loader2, Play, Maximize2, Minimize2, XCircle } from "lucide-react";
import { apiService, toastService } from "@/services";

interface AddApiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (api: { name: string; url: string }) => void;
  editingApi?: { name: string; url: string } | null;
}

interface TestResult {
  status: number;
  time: number;
  response: any;
}

export function AddApiModal({ isOpen, onClose, onAdd, editingApi }: AddApiModalProps) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [errors, setErrors] = useState({ name: "", url: "" });
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  useEffect(() => {
    if (editingApi) {
      setName(editingApi.name);
      setUrl(editingApi.url);
    } else {
      setName("");
      setUrl("");
    }
    setTestResult(null);
    setErrors({ name: "", url: "" });
  }, [editingApi, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = { name: "", url: "" };
    
    if (!name.trim()) {
      newErrors.name = "API name is required";
    }
    
    if (!url.trim()) {
      newErrors.url = "API URL is required";
    } else if (!/^https?:\/\/.+/.test(url)) {
      newErrors.url = "Invalid URL format";
    }
    
    setErrors(newErrors);
    return !newErrors.name && !newErrors.url;
  };

  const handleTest = async () => {
    if (!url.trim() || !/^https?:\/\/.+/.test(url)) {
      setErrors({ ...errors, url: "Valid URL required to test" });
      return;
    }

    const controller = new AbortController();
    setAbortController(controller);
    setTesting(true);
    setTestResult(null);
    const startTime = Date.now();

    try {
      const data = await apiService.testApiConnection(url, controller.signal);
      const timeTaken = Date.now() - startTime;

      setTestResult({
        status: 200,
        time: timeTaken,
        response: data,
      });
      toastService.apiTest('API test successful', timeTaken);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        setTestResult({
          status: 0,
          time: Date.now() - startTime,
          response: { error: "Request cancelled" },
        });
        toastService.info('Request cancelled');
      } else {
        setTestResult({
          status: 0,
          time: Date.now() - startTime,
          response: { error: "Failed to fetch" },
        });
        toastService.error('API test failed', 'Unable to connect to the API endpoint');
      }
    } finally {
      setTesting(false);
      setAbortController(null);
    }
  };

  const handleCancelTest = () => {
    if (abortController) {
      abortController.abort();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onAdd({ name, url });
      setName("");
      setUrl("");
      setErrors({ name: "", url: "" });
      setTestResult(null);
      toastService.success(editingApi ? 'API updated successfully' : 'API added successfully');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className={`bg-[#1A1F2E] rounded-lg border border-zinc-800 w-full p-6 max-h-[90vh] overflow-y-auto transition-all ${isExpanded ? "max-w-3xl" : "max-w-md"}`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">
            {editingApi ? "Edit API" : "Add New API"}
          </h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-zinc-300 mb-2">API Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Get Users"
              className="bg-[#0B0F17] border-zinc-700 text-white"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm text-zinc-300 mb-2">API URL</label>
            <div className="flex gap-2">
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://api.example.com/users"
                className="bg-[#0B0F17] border-zinc-700 text-white flex-1"
              />
              <Button
                type="button"
                onClick={handleTest}
                disabled={testing}
                size="icon"
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Play className="w-4 h-4" />
              </Button>
              {testing && (
                <Button
                  type="button"
                  onClick={handleCancelTest}
                  size="icon"
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <XCircle className="w-4 h-4" />
                </Button>
              )}
            </div>
            {errors.url && <p className="text-red-500 text-xs mt-1">{errors.url}</p>}
          </div>

          {testResult && (
            <div className="bg-[#0B0F17] rounded-lg p-4 border border-zinc-800">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-4">
                  <span className={`text-sm font-semibold ${testResult.status === 200 ? "text-green-500" : "text-red-500"}`}>
                    Status: {testResult.status}
                  </span>
                  <span className="text-sm text-zinc-400">
                    {testResult.time}ms
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-zinc-400 hover:text-white"
                >
                  {isExpanded ? (
                    <Minimize2 className="w-4 h-4" />
                  ) : (
                    <Maximize2 className="w-4 h-4" />
                  )}
                </button>
              </div>
              <pre className={`text-xs text-zinc-300 font-mono overflow-auto bg-black/30 p-3 rounded ${isExpanded ? "max-h-96" : "max-h-48"}`}>
{JSON.stringify(testResult.response, null, 2)}
              </pre>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button type="button" onClick={onClose} variant="outline" className="flex-1 border-zinc-700 text-zinc-400 hover:text-zinc-300 bg-zinc-800/50 hover:bg-zinc-800">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-white text-black hover:bg-zinc-200">
              {editingApi ? "Update API" : "Add API"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
