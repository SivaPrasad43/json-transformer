"use client";

import { useState, useEffect } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";

interface Api {
  id: string;
  name: string;
  url: string;
}

interface TransformWorkspaceProps {
  apis: Api[];
}

const sampleOutput = {
  fullName: "",
  contact: {
    email: ""
  },
  orderCount: 0
};

function JsonTreeNode({ keyName, value, level = 0 }: any) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isObject = typeof value === "object" && value !== null && !Array.isArray(value);
  const isArray = Array.isArray(value);
  const isExpandable = isObject || isArray;
  
  const getType = () => {
    if (isArray) return "array";
    if (isObject) return "object";
    return typeof value;
  };

  return (
    <div className="font-mono text-sm">
      <div
        className="flex items-center gap-1 py-1 hover:bg-zinc-800/50 cursor-pointer"
        style={{ paddingLeft: `${level * 16}px` }}
        onClick={() => isExpandable && setIsExpanded(!isExpanded)}
      >
        {isExpandable ? (
          isExpanded ? (
            <ChevronDown className="w-4 h-4 text-zinc-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-zinc-500" />
          )
        ) : (
          <span className="w-4" />
        )}
        <span className="text-indigo-400">{keyName}</span>
        <span className="text-zinc-600">:</span>
        <span className="text-zinc-500 text-xs">{getType()}</span>
      </div>
      {isExpandable && isExpanded && (
        <div>
          {isArray ? (
            value.length > 0 && (
              <JsonTreeNode key="0" keyName="[0]" value={value[0]} level={level + 1} />
            )
          ) : (
            Object.entries(value).map(([key, val]) => (
              <JsonTreeNode key={key} keyName={key} value={val} level={level + 1} />
            ))
          )}
        </div>
      )}
    </div>
  );
}

function OutputTreeNode({ keyName, value, level = 0, path = "", onUpdate }: any) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [newType, setNewType] = useState("string");
  const [isDefiningArray, setIsDefiningArray] = useState(false);
  const [arrayItemType, setArrayItemType] = useState("object");
  const [isEditingType, setIsEditingType] = useState(false);
  const [editType, setEditType] = useState("");
  
  const isObject = typeof value === "object" && value !== null && !Array.isArray(value);
  const isArray = Array.isArray(value);
  const isExpandable = isObject || isArray;
  
  const getType = () => {
    if (isArray) return "array";
    if (isObject) return "object";
    return typeof value;
  };

  // Build current path - convert [0] to 0 for numeric indices
  const currentPath = path ? `${path}.${keyName.replace(/\[(\d+)\]/, '$1')}` : keyName.replace(/\[(\d+)\]/, '$1');

  const handleAddField = () => {
    if (!newKey) return;
    const defaultValue = newType === "string" ? "" : newType === "number" ? 0 : newType === "object" ? {} : [];
    onUpdate(`${currentPath}.${newKey}`, defaultValue);
    setNewKey("");
    setNewType("string");
    setIsAdding(false);
  };

  const handleDefineArrayItem = () => {
    const defaultItem = arrayItemType === "string" ? "" : arrayItemType === "number" ? 0 : {};
    onUpdate(currentPath, [defaultItem]);
    setIsDefiningArray(false);
  };

  const handleChangeType = () => {
    const defaultValue = editType === "string" ? "" : editType === "number" ? 0 : editType === "object" ? {} : [];
    onUpdate(currentPath, defaultValue);
    setIsEditingType(false);
  };

  return (
    <div className="font-mono text-sm">
      <div
        className="flex items-center gap-2 py-1 hover:bg-zinc-800/50 group"
        style={{ paddingLeft: `${level * 16}px` }}
      >
        {isExpandable ? (
          <div onClick={() => setIsExpanded(!isExpanded)} className="cursor-pointer">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-zinc-500" />
            ) : (
              <ChevronRight className="w-4 h-4 text-zinc-500" />
            )}
          </div>
        ) : (
          <span className="w-4" />
        )}
        <span className="text-indigo-400">{keyName}</span>
        <span className="text-zinc-600">:</span>
        {!isEditingType ? (
          <>
            <span 
              className="text-zinc-500 text-xs cursor-pointer hover:text-indigo-400"
              onClick={() => {
                setEditType(getType());
                setIsEditingType(true);
              }}
            >
              {getType()}
            </span>
            {!isExpandable && (
              <input
                type="text"
                placeholder="input.path"
                className="ml-2 flex-1 bg-zinc-900 border border-zinc-700 rounded px-2 py-0.5 text-xs text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
              />
            )}
            {isExpandable && (
              <button
                onClick={() => setIsAdding(!isAdding)}
                className="ml-auto opacity-0 group-hover:opacity-100 text-indigo-400 text-xs px-2 py-0.5 hover:bg-zinc-800 rounded"
              >
                + Add
              </button>
            )}
          </>
        ) : (
          <>
            <select
              value={editType}
              onChange={(e) => setEditType(e.target.value)}
              className="bg-zinc-900 border border-zinc-700 rounded px-2 py-0.5 text-xs text-zinc-300"
            >
              <option value="string">string</option>
              <option value="number">number</option>
              <option value="object">object</option>
              <option value="array">array</option>
            </select>
            <button
              onClick={handleChangeType}
              className="text-green-400 text-xs px-2 py-0.5 hover:bg-zinc-800 rounded"
            >
              ✓
            </button>
            <button
              onClick={() => setIsEditingType(false)}
              className="text-red-400 text-xs px-2 py-0.5 hover:bg-zinc-800 rounded"
            >
              ✕
            </button>
          </>
        )}
      </div>
      {isExpandable && isExpanded && (
        <div>
          {isArray ? (
            <>
              {value.length > 0 ? (
                <OutputTreeNode 
                  key="0" 
                  keyName="[0]" 
                  value={value[0]} 
                  level={level + 1}
                  path={currentPath}
                  onUpdate={onUpdate}
                />
              ) : (
                <>
                  {!isDefiningArray ? (
                    <div 
                      className="flex items-center gap-2 py-1 text-zinc-500 text-xs"
                      style={{ paddingLeft: `${(level + 1) * 16 + 4}px` }}
                    >
                      <span className="w-4" />
                      Empty array - 
                      <button
                        onClick={() => setIsDefiningArray(true)}
                        className="text-indigo-400 hover:underline"
                      >
                        define item structure
                      </button>
                    </div>
                  ) : (
                    <div 
                      className="flex items-center gap-2 py-1"
                      style={{ paddingLeft: `${(level + 1) * 16 + 4}px` }}
                    >
                      <span className="w-4" />
                      <span className="text-zinc-500 text-xs">Item type:</span>
                      <select
                        value={arrayItemType}
                        onChange={(e) => setArrayItemType(e.target.value)}
                        className="bg-zinc-900 border border-zinc-700 rounded px-2 py-0.5 text-xs text-zinc-300"
                      >
                        <option value="string">string</option>
                        <option value="number">number</option>
                        <option value="object">object</option>
                      </select>
                      <button
                        onClick={handleDefineArrayItem}
                        className="text-green-400 text-xs px-2 py-0.5 hover:bg-zinc-800 rounded"
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => setIsDefiningArray(false)}
                        className="text-red-400 text-xs px-2 py-0.5 hover:bg-zinc-800 rounded"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            <>
              {Object.entries(value).map(([key, val]) => (
                <OutputTreeNode 
                  key={key} 
                  keyName={key} 
                  value={val} 
                  level={level + 1}
                  path={currentPath}
                  onUpdate={onUpdate}
                />
              ))}
              {isAdding && (
                <div 
                  className="flex items-center gap-2 py-1"
                  style={{ paddingLeft: `${(level + 1) * 16 + 4}px` }}
                >
                  <span className="w-4" />
                  <input
                    type="text"
                    placeholder="key"
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value)}
                    className="bg-zinc-900 border border-zinc-700 rounded px-2 py-0.5 text-xs text-zinc-300 w-24"
                  />
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="bg-zinc-900 border border-zinc-700 rounded px-2 py-0.5 text-xs text-zinc-300"
                  >
                    <option value="string">string</option>
                    <option value="number">number</option>
                    <option value="object">object</option>
                    <option value="array">array</option>
                  </select>
                  <button
                    onClick={handleAddField}
                    className="text-green-400 text-xs px-2 py-0.5 hover:bg-zinc-800 rounded"
                  >
                    ✓
                  </button>
                  <button
                    onClick={() => setIsAdding(false)}
                    className="text-red-400 text-xs px-2 py-0.5 hover:bg-zinc-800 rounded"
                  >
                    ✕
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export function TransformWorkspace({ apis }: TransformWorkspaceProps) {
  const [inputJson, setInputJson] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"preview" | "logs" | "errors">("preview");
  const [logs, setLogs] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [bottomHeight, setBottomHeight] = useState(250);
  const [isDragging, setIsDragging] = useState(false);
  const [outputSchema, setOutputSchema] = useState<any>(sampleOutput);
  const [isAddingRoot, setIsAddingRoot] = useState(false);
  const [newRootKey, setNewRootKey] = useState("");
  const [newRootType, setNewRootType] = useState("string");

  const handleMouseDown = () => setIsDragging(true);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const newHeight = window.innerHeight - e.clientY - 64;
      setBottomHeight(Math.max(150, Math.min(newHeight, window.innerHeight - 300)));
    };

    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  useEffect(() => {
    if (apis.length > 0) {
      fetchAllApis();
    } else {
      setInputJson({});
    }
  }, [apis]);

  const fetchAllApis = async () => {
    setLoading(true);
    setLogs([]);
    setErrors([]);
    const result: any = {};

    await Promise.all(
      apis.map(async (api) => {
        try {
          setLogs(prev => [...prev, `Fetching ${api.name} from ${api.url}`]);
          const response = await fetch(api.url);
          const data = await response.json();
          const apiKey = api.name.toLowerCase().replace(/\s+/g, '');
          result[apiKey] = data;
          setLogs(prev => [...prev, `✓ ${api.name} fetched successfully`]);
        } catch (error) {
          const apiKey = api.name.toLowerCase().replace(/\s+/g, '');
          result[apiKey] = { error: "Failed to fetch" };
          setErrors(prev => [...prev, `✗ ${api.name}: Failed to fetch from ${api.url}`]);
        }
      })
    );

    setInputJson(result);
    setLoading(false);
  };

  const handleUpdateSchema = (path: string, value: any) => {
    const keys = path.split('.');
    const newSchema = JSON.parse(JSON.stringify(outputSchema)); // Deep clone
    let current = newSchema;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      // Handle array indices
      if (!isNaN(Number(key))) {
        const index = Number(key);
        if (!current[index]) current[index] = {};
        current = current[index];
      } else {
        if (!current[key]) current[key] = {};
        current = current[key];
      }
    }
    
    const lastKey = keys[keys.length - 1];
    current[lastKey] = value;
    setOutputSchema(newSchema);
  };

  const handleAddRootField = () => {
    if (!newRootKey) return;
    const defaultValue = newRootType === "string" ? "" : newRootType === "number" ? 0 : newRootType === "object" ? {} : [];
    setOutputSchema({ ...outputSchema, [newRootKey]: defaultValue });
    setNewRootKey("");
    setNewRootType("string");
    setIsAddingRoot(false);
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Central Section */}
      <div className="flex gap-4 p-3" style={{ height: `calc(100% - ${bottomHeight}px)` }}>
        {/* Input JSON Panel */}
        <div className="flex-1 bg-black rounded-lg border border-zinc-800 flex flex-col">
          <div className="px-4 py-3 border-b border-zinc-800">
            <h3 className="text-sm font-semibold text-zinc-300">Input JSON</h3>
          </div>
          <div className="flex-1 overflow-auto p-4">
            {loading ? (
              <p className="text-zinc-500 text-sm">Loading APIs...</p>
            ) : Object.keys(inputJson).length > 0 ? (
              Object.entries(inputJson).map(([key, value]) => (
                <JsonTreeNode key={key} keyName={key} value={value} />
              ))
            ) : (
              <p className="text-zinc-500 text-sm">No APIs available</p>
            )}
          </div>
        </div>

        {/* Output JSON Panel */}
        <div className="flex-1 bg-black rounded-lg border border-zinc-800 flex flex-col">
          <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-300">Output JSON</h3>
            <button
              onClick={() => setIsAddingRoot(!isAddingRoot)}
              className="text-indigo-400 text-xs px-2 py-1 hover:bg-zinc-800 rounded"
            >
              + Add Field
            </button>
          </div>
          <div className="flex-1 overflow-auto p-4">
            {isAddingRoot && (
              <div className="flex items-center gap-2 py-2 mb-2 border-b border-zinc-800">
                <input
                  type="text"
                  placeholder="key"
                  value={newRootKey}
                  onChange={(e) => setNewRootKey(e.target.value)}
                  className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-300 w-32"
                />
                <select
                  value={newRootType}
                  onChange={(e) => setNewRootType(e.target.value)}
                  className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-300"
                >
                  <option value="string">string</option>
                  <option value="number">number</option>
                  <option value="object">object</option>
                  <option value="array">array</option>
                </select>
                <button
                  onClick={handleAddRootField}
                  className="text-green-400 text-xs px-2 py-1 hover:bg-zinc-800 rounded"
                >
                  ✓
                </button>
                <button
                  onClick={() => setIsAddingRoot(false)}
                  className="text-red-400 text-xs px-2 py-1 hover:bg-zinc-800 rounded"
                >
                  ✕
                </button>
              </div>
            )}
            {Object.entries(outputSchema).map(([key, value]) => (
              <OutputTreeNode key={key} keyName={key} value={value} onUpdate={handleUpdateSchema} />
            ))}
          </div>
        </div>
      </div>

      {/* Resize Handle */}
      <div
        onMouseDown={handleMouseDown}
        className="h-1 bg-zinc-800 hover:bg-indigo-500 cursor-ns-resize transition-colors"
      />

      {/* Bottom Section */}
      <div className="bg-black border-t border-zinc-800 flex flex-col" style={{ height: `${bottomHeight}px` }}>
        <div className="flex border-b border-zinc-800">
          <button
            onClick={() => setActiveTab("preview")}
            className={`px-4 py-2 text-xs font-medium ${
              activeTab === "preview"
                ? "text-indigo-400 border-b-2 border-indigo-400"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Preview
          </button>
          <button
            onClick={() => setActiveTab("logs")}
            className={`px-4 py-2 text-xs font-medium ${
              activeTab === "logs"
                ? "text-indigo-400 border-b-2 border-indigo-400"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Logs {logs.length > 0 && <span className="ml-1">({logs.length})</span>}
          </button>
          <button
            onClick={() => setActiveTab("errors")}
            className={`px-4 py-2 text-xs font-medium ${
              activeTab === "errors"
                ? "text-indigo-400 border-b-2 border-indigo-400"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Errors {errors.length > 0 && <span className="ml-1 text-red-400">({errors.length})</span>}
          </button>
        </div>
        <div className="flex-1 overflow-auto p-4">
          {activeTab === "preview" && (
            <div className="text-sm text-zinc-300">
              <pre className="font-mono">{JSON.stringify(sampleOutput, null, 2)}</pre>
            </div>
          )}
          {activeTab === "logs" && (
            <div className="space-y-1">
              {logs.length > 0 ? (
                logs.map((log, i) => (
                  <div key={i} className="text-xs text-zinc-400 font-mono">
                    {log}
                  </div>
                ))
              ) : (
                <p className="text-zinc-500 text-xs">No logs available</p>
              )}
            </div>
          )}
          {activeTab === "errors" && (
            <div className="space-y-1">
              {errors.length > 0 ? (
                errors.map((error, i) => (
                  <div key={i} className="text-xs text-red-400 font-mono">
                    {error}
                  </div>
                ))
              ) : (
                <p className="text-zinc-500 text-xs">No errors</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
