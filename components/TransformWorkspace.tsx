"use client";

import { useState, useEffect } from "react";
import { ChevronRight, ChevronDown, Play, Rocket, Copy, X, ArrowLeft } from "lucide-react";
import { JsonViewer } from "./JsonViewer";
import { configService, apiService, type Api } from "@/services";
import { config as appConfig } from "@/lib/config";

interface TransformWorkspaceProps {
  apis: Api[];
  onBack?: () => void;
  initialConfig?: {
    id?: string;
    name?: string;
    outputSchema?: any;
    mappings?: Record<string, string>;
  } | null;
}

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

function OutputTreeNode({ keyName, value, level = 0, path = "", onUpdate, onDelete, inputJson, onMappingChange, mappings }: any) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [newType, setNewType] = useState("string");
  const [isDefiningArray, setIsDefiningArray] = useState(false);
  const [arrayItemType, setArrayItemType] = useState("object");
  const [isEditingType, setIsEditingType] = useState(false);
  const [editType, setEditType] = useState("");
  
  // Build current path
  const currentPath = path 
    ? keyName.startsWith('[') ? `${path}${keyName}` : `${path}.${keyName}`
    : keyName;
  
  const [mappingValue, setMappingValue] = useState(mappings[currentPath] || "");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const isObject = typeof value === "object" && value !== null && !Array.isArray(value);
  const isArray = Array.isArray(value);
  const isExpandable = isObject || isArray;
  
  const getType = () => {
    if (isArray) return "array";
    if (isObject) return "object";
    return typeof value;
  };

  // Get all possible paths from inputJson
  const getAllPaths = (obj: any, prefix = ""): string[] => {
    const paths: string[] = [];
    
    const traverse = (current: any, currentPath: string) => {
      if (typeof current === "object" && current !== null) {
        if (Array.isArray(current)) {
          if (current.length > 0) {
            paths.push(`${currentPath}[0]`);
            traverse(current[0], `${currentPath}[0]`);
          }
        } else {
          Object.keys(current).forEach(key => {
            const newPath = currentPath ? `${currentPath}.${key}` : key;
            paths.push(newPath);
            traverse(current[key], newPath);
          });
        }
      }
    };
    
    traverse(obj, prefix);
    return paths;
  };

  const handleMappingChange = (val: string) => {
    setMappingValue(val);
    onMappingChange(currentPath, val);
    if (val) {
      const allPaths = getAllPaths(inputJson);
      const filtered = allPaths.filter(p => p.toLowerCase().includes(val.toLowerCase()));
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
      setSelectedIndex(0);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;
    
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      setMappingValue(suggestions[selectedIndex]);
      onMappingChange(currentPath, suggestions[selectedIndex]);
      setShowSuggestions(false);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (suggestion: string) => {
    setMappingValue(suggestion);
    onMappingChange(currentPath, suggestion);
    setShowSuggestions(false);
  };

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
              <div className="relative ml-2 flex-1">
                <input
                  type="text"
                  placeholder="input.path"
                  value={mappingValue}
                  onChange={(e) => handleMappingChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-0.5 text-xs text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
                />
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 mt-1 w-full bg-zinc-900 border border-zinc-700 rounded shadow-lg max-h-48 overflow-y-auto z-50">
                    {suggestions.map((suggestion, idx) => (
                      <div
                        key={idx}
                        onClick={() => selectSuggestion(suggestion)}
                        className={`px-2 py-1 text-xs cursor-pointer ${
                          idx === selectedIndex ? "bg-indigo-600 text-white" : "text-zinc-300 hover:bg-zinc-800"
                        }`}
                      >
                        {suggestion}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {isExpandable && (
              <button
                onClick={() => setIsAdding(!isAdding)}
                className="ml-auto opacity-0 group-hover:opacity-100 text-indigo-400 text-xs px-2 py-0.5 hover:bg-zinc-800 rounded"
              >
                + Add
              </button>
            )}
            <button
              onClick={() => onDelete(currentPath)}
              className="opacity-0 group-hover:opacity-100 text-red-400 text-xs px-2 py-0.5 hover:bg-zinc-800 rounded"
            >
              ✕
            </button>
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
                  onDelete={onDelete}
                  inputJson={inputJson}
                  onMappingChange={onMappingChange}
                  mappings={mappings}
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
                  onDelete={onDelete}
                  inputJson={inputJson}
                  onMappingChange={onMappingChange}
                  mappings={mappings}
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

export function TransformWorkspace({ apis, onBack, initialConfig }: TransformWorkspaceProps) {
  const [inputJson, setInputJson] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"preview" | "logs" | "errors">("preview");
  const [logs, setLogs] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [bottomHeight, setBottomHeight] = useState(250);
  const [isDragging, setIsDragging] = useState(false);
  const [outputSchema, setOutputSchema] = useState<any>(initialConfig?.outputSchema || {});
  const [isAddingRoot, setIsAddingRoot] = useState(false);
  const [newRootKey, setNewRootKey] = useState("");
  const [newRootType, setNewRootType] = useState("string");
  const [mappings, setMappings] = useState<Record<string, string>>(initialConfig?.mappings || {});
  const [transformedOutput, setTransformedOutput] = useState<any>({});
  const [inputView, setInputView] = useState<"tree" | "json">("tree");
  const [outputView, setOutputView] = useState<"tree" | "json">("tree");
  const [deploying, setDeploying] = useState(false);
  const [deployedEndpoint, setDeployedEndpoint] = useState<string | null>(null);
  const [showDeployDialog, setShowDeployDialog] = useState(false);
  const [configName, setConfigName] = useState(initialConfig?.name || "");

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
          const data = await apiService.testApiConnection(api.url);
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

  const handleDeleteField = (path: string) => {
    const keys = path.split('.');
    const newSchema = JSON.parse(JSON.stringify(outputSchema));
    let current = newSchema;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!isNaN(Number(key))) {
        current = current[Number(key)];
      } else {
        current = current[key];
      }
    }
    
    const lastKey = keys[keys.length - 1];
    delete current[lastKey];
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

  const handleMappingUpdate = (path: string, mapping: string) => {
    setMappings(prev => ({ ...prev, [path]: mapping }));
  };

  const getValueFromPath = (obj: any, path: string) => {
    console.log('getValueFromPath called with path:', path);
    console.log('Input object:', obj);
    try {
      // Split path into parts, handling array notation
      const parts = path.split(/\.(?![^\[]*\])/).map(part => {
        // Check if part contains array index like "users[0]"
        const match = part.match(/^([^\[]+)\[(\d+)\]$/);
        if (match) {
          return [match[1], parseInt(match[2])];
        }
        return part;
      }).flat();

      console.log('Path parts:', parts);
      let current = obj;
      
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        console.log(`Step ${i}: part="${part}", current type:`, Array.isArray(current) ? 'array' : typeof current);
        
        if (current === undefined || current === null) {
          console.log('Current is undefined/null, returning undefined');
          return undefined;
        }
        
        current = current[part];
        console.log(`After accessing [${part}]:`, Array.isArray(current) ? `array with ${current.length} items` : typeof current);
        
        // If we hit an array and there are more parts to traverse
        if (Array.isArray(current) && i < parts.length - 1) {
          console.log('Found array, mapping over items with remaining parts:', parts.slice(i + 1));
          // Get remaining path parts
          let remaining = parts.slice(i + 1);
          
          // Skip numeric index if the next part is a number (array index notation)
          if (typeof remaining[0] === 'number') {
            remaining = remaining.slice(1);
            console.log('Skipped numeric index, new remaining:', remaining);
          }
          
          // Map over array and get value from each item
          const result = current.map(item => {
            let val = item;
            for (const r of remaining) {
              if (val === undefined || val === null) return undefined;
              val = val[r];
            }
            return val;
          }).filter(v => v !== undefined);
          
          console.log('Array mapping result:', result);
          return result;
        }
      }
      
      console.log('Final result:', current);
      return current;
    } catch (e) {
      console.error('Error getting value from path:', path, e);
      return undefined;
    }
  };

  const handleRun = () => {
    console.log('=== Starting transformation ===');
    console.log('Output schema:', outputSchema);
    console.log('Mappings:', mappings);
    console.log('Input JSON:', inputJson);
    
    setLogs(prev => [...prev, "Starting transformation..."]);
    setErrors([]);
    const result: any = {};
    let errorCount = 0;

    const transform = (schema: any, parentPath = ""): any => {
      console.log('Transform called with parentPath:', parentPath, 'schema:', schema);
      
      if (typeof schema === "object" && schema !== null && !Array.isArray(schema)) {
        const obj: any = {};
        Object.keys(schema).forEach(key => {
          const currentPath = parentPath 
            ? key.startsWith('[') ? `${parentPath}${key}` : `${parentPath}.${key}`
            : key;
          
          // Check if this is an array and its first item [0] has a mapping
          if (Array.isArray(schema[key]) && schema[key].length > 0) {
            const arrayItemPath = `${currentPath}[0]`;
            const arrayItemMapping = mappings[arrayItemPath];
            
            console.log(`Array field: ${key}, checking item mapping at ${arrayItemPath}: ${arrayItemMapping}`);
            
            if (arrayItemMapping) {
              const value = getValueFromPath(inputJson, arrayItemMapping);
              console.log(`Got value for array ${currentPath}:`, value);
              if (value !== undefined) {
                obj[key] = value;
                setLogs(prev => [...prev, `✓ Mapped ${currentPath} from ${arrayItemMapping}`]);
                return;
              }
            }
          }
          
          const mapping = mappings[currentPath];
          
          console.log(`Processing key: ${key}, currentPath: ${currentPath}, mapping: ${mapping}`);
          
          if (mapping) {
            const value = getValueFromPath(inputJson, mapping);
            console.log(`Got value for ${currentPath}:`, value);
            if (value !== undefined) {
              obj[key] = value;
              setLogs(prev => [...prev, `✓ Mapped ${currentPath} from ${mapping}`]);
            } else {
              setErrors(prev => [...prev, `✗ Path "${mapping}" not found for field "${currentPath}"`]);
              errorCount++;
              obj[key] = null;
            }
          } else if (typeof schema[key] === "object") {
            obj[key] = transform(schema[key], currentPath);
          } else {
            obj[key] = schema[key];
          }
        });
        return obj;
      } else if (Array.isArray(schema)) {
        console.log('Schema is array, mapping over items');
        return schema.map((item, idx) => {
          const arrayPath = `${parentPath}[${idx}]`;
          const mapping = mappings[arrayPath];
          
          console.log(`Array item ${idx}, path: ${arrayPath}, mapping: ${mapping}`);
          
          // Check if the array item itself has a mapping
          if (mapping) {
            const value = getValueFromPath(inputJson, mapping);
            console.log(`Got value for array item ${arrayPath}:`, value);
            if (value !== undefined) {
              setLogs(prev => [...prev, `✓ Mapped ${arrayPath} from ${mapping}`]);
              return value;
            } else {
              setErrors(prev => [...prev, `✗ Path "${mapping}" not found for field "${arrayPath}"`]);
              errorCount++;
              return null;
            }
          }
          
          return transform(item, arrayPath);
        });
      }
      return schema;
    };

    const transformed = transform(outputSchema);
    console.log('=== Transformation complete ===');
    console.log('Transformed output:', transformed);
    setTransformedOutput(transformed);
    setLogs(prev => [...prev, `Transformation complete. ${errorCount} error(s)`]);
  };

  const handleDeploy = async () => {
    if (!configName.trim()) {
      setErrors(prev => [...prev, "Please enter a configuration name"]);
      return;
    }

    setDeploying(true);
    setErrors([]);

    try {
      const config = {
        name: configName,
        apis: apis.map(api => ({
          id: api.id,
          name: api.name,
          url: api.url
        })),
        outputSchema,
        mappings
      };

      const isEditing = initialConfig?.id;
      
      const data = isEditing 
        ? await configService.updateConfig(initialConfig.id!, config)
        : await configService.createConfig(config);

      const backendUrl = appConfig.publicBackendUrl || window.location.origin;
      const endpoint = `${backendUrl}/api/transform/${data.id}`;
      setDeployedEndpoint(endpoint);
      setLogs(prev => [...prev, `✓ Configuration ${isEditing ? 'updated' : 'deployed'} successfully`]);
      setShowDeployDialog(false);
      setConfigName("");
    } catch (error) {
      setErrors(prev => [...prev, `✗ Deployment failed: ${error}`]);
    } finally {
      setDeploying(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setLogs(prev => [...prev, "✓ Endpoint URL copied to clipboard"]);
  };

  const getStructure = (obj: any): any => {
    if (obj === null) return "null";
    if (Array.isArray(obj)) {
      return obj.length > 0 ? [getStructure(obj[0])] : [];
    }
    if (typeof obj === "object") {
      const structure: any = {};
      Object.keys(obj).forEach(key => {
        structure[key] = getStructure(obj[key]);
      });
      return structure;
    }
    return typeof obj;
  };

  const getStructureWithMapping = (schema: any, parentPath = ""): any => {
    return {
      structure: getStructure(schema),
      mappings: mappings
    };
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Header with Back Button */}
      {onBack && (
        <div className="px-4 py-3 border-b border-zinc-800 flex items-center gap-3">
          <button
            onClick={onBack}
            className="text-zinc-400 hover:text-zinc-200 flex items-center gap-2 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
        </div>
      )}
      
      {/* Central Section */}
      <div className="flex gap-4 p-3" style={{ height: `calc(100% - ${bottomHeight}px - ${onBack ? '48px' : '0px'})` }}>
        {/* Input JSON Panel */}
        <div className="flex-1 bg-black rounded-lg border border-zinc-800 flex flex-col">
          <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-300">Input JSON</h3>
            <div className="flex gap-1 bg-zinc-900 rounded p-0.5">
              <button
                onClick={() => setInputView("tree")}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  inputView === "tree"
                    ? "bg-zinc-800 text-zinc-200"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Tree
              </button>
              <button
                onClick={() => setInputView("json")}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  inputView === "json"
                    ? "bg-zinc-800 text-zinc-200"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                JSON
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-4">
            {loading ? (
              <p className="text-zinc-500 text-sm">Loading APIs...</p>
            ) : Object.keys(inputJson).length > 0 ? (
              inputView === "tree" ? (
                Object.entries(inputJson).map(([key, value]) => (
                  <div key={key}>
                    <JsonTreeNode keyName={key} value={value} />
                  </div>
                ))
              ) : (
                <pre className="font-mono text-sm text-zinc-300 whitespace-pre-wrap break-words">{JSON.stringify(getStructure(inputJson), null, 2)}</pre>
              )
            ) : (
              <p className="text-zinc-500 text-sm">No APIs available</p>
            )}
          </div>
        </div>

        {/* Output JSON Panel */}
        <div className="flex-1 bg-black rounded-lg border border-zinc-800 flex flex-col">
          <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-300">Output JSON</h3>
            <div className="flex gap-2 items-center">
              <div className="flex gap-1 bg-zinc-900 rounded p-0.5">
                <button
                  onClick={() => setOutputView("tree")}
                  className={`px-3 py-1 text-xs rounded transition-colors ${
                    outputView === "tree"
                      ? "bg-zinc-800 text-zinc-200"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  Tree
                </button>
                <button
                  onClick={() => setOutputView("json")}
                  className={`px-3 py-1 text-xs rounded transition-colors ${
                    outputView === "json"
                      ? "bg-zinc-800 text-zinc-200"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  JSON
                </button>
              </div>
              <button
                onClick={handleRun}
                className="text-white bg-indigo-600 hover:bg-indigo-700 text-xs px-3 py-1 rounded flex items-center gap-1"
              >
                <Play className="w-3 h-3" />
                Run
              </button>
              <button
                onClick={() => setShowDeployDialog(true)}
                className="text-white bg-green-600 hover:bg-green-700 text-xs px-3 py-1 rounded flex items-center gap-1"
              >
                <Rocket className="w-3 h-3" />
                Deploy
              </button>
              {outputView === "tree" && (
                <button
                  onClick={() => setIsAddingRoot(!isAddingRoot)}
                  className="text-indigo-400 text-xs px-2 py-1 hover:bg-zinc-800 rounded"
                >
                  + Add Field
                </button>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-auto p-4">
            {outputView === "tree" ? (
              <>
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
                  <OutputTreeNode 
                    key={key} 
                    keyName={key} 
                    value={value} 
                    onUpdate={handleUpdateSchema} 
                    onDelete={handleDeleteField}
                    inputJson={inputJson}
                    onMappingChange={handleMappingUpdate}
                    mappings={mappings}
                  />
                ))}
              </>
            ) : (
              <pre className="font-mono text-sm text-zinc-300 whitespace-pre-wrap break-words">{JSON.stringify(getStructureWithMapping(outputSchema), null, 2)}</pre>
            )}
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
              {Object.keys(transformedOutput).length > 0 ? (
                <pre className="font-mono">{JSON.stringify(transformedOutput, null, 2)}</pre>
              ) : (
                <p className="text-zinc-500 text-xs">Click "Run" to see the transformed output</p>
              )}
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

      {/* Deploy Dialog */}
      {showDeployDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 w-96">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-zinc-200">Deploy Configuration</h3>
              <button
                onClick={() => setShowDeployDialog(false)}
                className="text-zinc-500 hover:text-zinc-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-4">
              <label className="block text-sm text-zinc-400 mb-2">Configuration Name</label>
              <input
                type="text"
                value={configName}
                onChange={(e) => setConfigName(e.target.value)}
                placeholder="e.g., User Posts Aggregator"
                className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleDeploy}
                disabled={deploying || !configName.trim()}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-zinc-700 disabled:text-zinc-500 text-white text-sm px-4 py-2 rounded flex items-center justify-center gap-2"
              >
                {deploying ? (
                  <>Deploying...</>
                ) : (
                  <>
                    <Rocket className="w-4 h-4" />
                    Deploy
                  </>
                )}
              </button>
              <button
                onClick={() => setShowDeployDialog(false)}
                className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deployed Endpoint Display */}
      {deployedEndpoint && (
        <div className="fixed bottom-4 right-4 bg-zinc-900 border border-green-500 rounded-lg p-4 w-96 shadow-lg">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <Rocket className="w-5 h-5 text-green-500" />
              <h4 className="text-sm font-semibold text-zinc-200">Deployed Successfully!</h4>
            </div>
            <button
              onClick={() => setDeployedEndpoint(null)}
              className="text-zinc-500 hover:text-zinc-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-zinc-400 mb-2">Your API endpoint:</p>
          <div className="flex items-center gap-2 bg-zinc-800 rounded px-3 py-2">
            <code className="flex-1 text-xs text-green-400 break-all">{deployedEndpoint}</code>
            <button
              onClick={() => copyToClipboard(deployedEndpoint)}
              className="text-zinc-400 hover:text-zinc-200"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
