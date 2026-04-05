"use client";

import { useState } from "react";
import { ChevronRight, ChevronDown, Copy, Check } from "lucide-react";

interface JsonViewerProps {
  data: any;
  title?: string;
}

function JsonNode({ keyName, value, level = 0, isLast = false }: any) {
  const [isExpanded, setIsExpanded] = useState(level < 2);
  const isObject = typeof value === "object" && value !== null && !Array.isArray(value);
  const isArray = Array.isArray(value);
  const isExpandable = isObject || isArray;
  const isString = typeof value === "string";
  const isNumber = typeof value === "number";
  const isBoolean = typeof value === "boolean";
  const isNull = value === null;

  const getValueColor = () => {
    if (isString) return "text-green-400";
    if (isNumber) return "text-blue-400";
    if (isBoolean) return "text-purple-400";
    if (isNull) return "text-red-400";
    return "text-zinc-300";
  };

  const renderValue = () => {
    if (isString) return `"${value}"`;
    if (isNull) return "null";
    return String(value);
  };

  return (
    <div className="font-mono text-sm">
      <div className="flex items-start gap-1">
        <span style={{ width: `${level * 16}px` }} />
        {isExpandable && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-0.5 hover:bg-zinc-800 rounded"
          >
            {isExpanded ? (
              <ChevronDown className="w-3 h-3 text-zinc-500" />
            ) : (
              <ChevronRight className="w-3 h-3 text-zinc-500" />
            )}
          </button>
        )}
        {!isExpandable && <span className="w-3" />}
        {keyName && (
          <>
            <span className="text-cyan-400">{keyName}</span>
            <span className="text-zinc-600">: </span>
          </>
        )}
        {isExpandable ? (
          <span className="text-zinc-500">
            {isArray ? "[" : "{"}
            {!isExpanded && (
              <span className="text-zinc-600 text-xs ml-1">
                {isArray ? `${value.length} items` : `${Object.keys(value).length} keys`}
              </span>
            )}
            {!isExpanded && (isArray ? "]" : "}")}
          </span>
        ) : (
          <span className={getValueColor()}>{renderValue()}</span>
        )}
        {!isExpandable && !isLast && <span className="text-zinc-600">,</span>}
      </div>
      {isExpandable && isExpanded && (
        <div>
          {isArray ? (
            value.map((item: any, idx: number) => (
              <JsonNode
                key={idx}
                value={item}
                level={level + 1}
                isLast={idx === value.length - 1}
              />
            ))
          ) : (
            Object.entries(value).map(([key, val], idx, arr) => (
              <JsonNode
                key={key}
                keyName={key}
                value={val}
                level={level + 1}
                isLast={idx === arr.length - 1}
              />
            ))
          )}
          <div className="flex items-start">
            <span style={{ width: `${level * 16}px` }} />
            <span className="w-3" />
            <span className="text-zinc-500">{isArray ? "]" : "}"}</span>
            {!isLast && <span className="text-zinc-600">,</span>}
          </div>
        </div>
      )}
    </div>
  );
}

export function JsonViewer({ data, title }: JsonViewerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-black rounded-lg border border-zinc-800">
      <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-300">{title || "JSON View"}</h3>
        <button
          onClick={handleCopy}
          className="text-zinc-400 hover:text-zinc-300 p-1 hover:bg-zinc-800 rounded"
          title="Copy JSON"
        >
          {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
      <div className="flex-1 overflow-auto p-4">
        {data && Object.keys(data).length > 0 ? (
          <JsonNode value={data} />
        ) : (
          <p className="text-zinc-500 text-sm">No data available</p>
        )}
      </div>
    </div>
  );
}
