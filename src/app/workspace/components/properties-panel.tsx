"use client";

import { useState } from "react";
import type { DesignElement, Screen, TableColumn } from "@/lib/types";
import { getPropertiesConfig } from "@/lib/properties-config";

interface PropertiesPanelProps {
  selectedElement: DesignElement | null;
  onUpdateElement: (id: string, updates: Partial<DesignElement>) => void;
  onRemoveElement: (id: string) => void;
  screens?: Screen[];
}

export default function PropertiesPanel({
  selectedElement,
  onUpdateElement,
  onRemoveElement,
  screens = [],
}: PropertiesPanelProps) {
  const [activeTab, setActiveTab] = useState("properties");
  const [newOptionLabel, setNewOptionLabel] = useState("");
  const [newOptionValue, setNewOptionValue] = useState("");
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [newColumnWidth, setNewColumnWidth] = useState(100);

  if (!selectedElement) {
    return (
      <div className="w-72 flex-shrink-0 border-l border-gray-200 bg-transparent p-4">
        <div className="flex h-full items-center justify-center text-center text-gray-500">
          <div>
            <p>Select an element to edit its properties</p>
          </div>
        </div>
      </div>
    );
  }

  const handlePropertyChange = (property: string, value: any) => {
    onUpdateElement(selectedElement.id, {
      properties: {
        ...selectedElement.properties,
        [property]: value,
      },
    });
  };

  const handlePositionChange = (property: string, value: number) => {
    onUpdateElement(selectedElement.id, {
      [property]: value,
    });
  };

  const propertiesConfig = getPropertiesConfig(selectedElement.type);

  // Handle dropdown options
  const handleAddOption = () => {
    if (newOptionLabel.trim() && newOptionValue.trim()) {
      const currentOptions = selectedElement.properties.options || [];
      let parsedOptions = [];

      try {
        parsedOptions =
          typeof currentOptions === "string"
            ? JSON.parse(currentOptions)
            : Array.isArray(currentOptions)
            ? currentOptions
            : [];
      } catch (e) {
        parsedOptions = [];
      }

      const newOptions = [...parsedOptions, { label: newOptionLabel, value: newOptionValue }];

      handlePropertyChange("options", JSON.stringify(newOptions));
      setNewOptionLabel("");
      setNewOptionValue("");
    }
  };

  const handleRemoveOption = (index: number) => {
    const currentOptions = selectedElement.properties.options || [];
    let parsedOptions = [];

    try {
      parsedOptions =
        typeof currentOptions === "string"
          ? JSON.parse(currentOptions)
          : Array.isArray(currentOptions)
          ? currentOptions
          : [];
    } catch (e) {
      parsedOptions = [];
    }

    const newOptions = parsedOptions.filter((_: any, i: number) => i !== index);
    handlePropertyChange("options", JSON.stringify(newOptions));
  };

  // Handle table columns
  const handleAddColumn = () => {
    if (newColumnTitle.trim()) {
      const currentColumns = selectedElement.properties.columns || [];
      let parsedColumns = [];

      try {
        parsedColumns =
          typeof currentColumns === "string"
            ? JSON.parse(currentColumns)
            : Array.isArray(currentColumns)
            ? currentColumns
            : [];
      } catch (e) {
        parsedColumns = [];
      }

      const newColumns = [
        ...parsedColumns,
        {
          id: `col-${Date.now()}`,
          title: newColumnTitle,
          width: newColumnWidth,
        },
      ];

      handlePropertyChange("columns", JSON.stringify(newColumns));
      setNewColumnTitle("");
      setNewColumnWidth(100);
    }
  };

  const handleRemoveColumn = (index: number) => {
    const currentColumns = selectedElement.properties.columns || [];
    let parsedColumns = [];

    try {
      parsedColumns =
        typeof currentColumns === "string"
          ? JSON.parse(currentColumns)
          : Array.isArray(currentColumns)
          ? currentColumns
          : [];
    } catch (e) {
      parsedColumns = [];
    }

    const newColumns = parsedColumns.filter((_: any, i: number) => i !== index);
    handlePropertyChange("columns", JSON.stringify(newColumns));
  };

  // Render dropdown options editor
  const renderOptionsEditor = () => {
    const currentOptions = selectedElement.properties.options || [];
    let parsedOptions = [];

    try {
      parsedOptions =
        typeof currentOptions === "string"
          ? JSON.parse(currentOptions)
          : Array.isArray(currentOptions)
          ? currentOptions
          : [];
    } catch (e) {
      parsedOptions = [];
    }

    return (
      <div className="mt-4 space-y-4 border-t border-gray-200 pt-4 bg-transparent">
        <h4 className="text-sm font-medium text-gray-700">Dropdown Options</h4>

        <div className="space-y-2">
          {parsedOptions.map((option: any, index: number) => (
            <div key={index} className="flex items-center justify-between rounded-md bg-gray-50 p-2">
              <div>
                <span className="text-xs font-medium text-gray-700">{option.label}</span>
                <span className="ml-2 text-xs text-gray-500">({option.value})</span>
              </div>
              <button onClick={() => handleRemoveOption(index)} className="rounded p-1 text-red-600 hover:bg-red-100">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={newOptionLabel}
              onChange={(e) => setNewOptionLabel(e.target.value)}
              placeholder="Label"
              className="w-full rounded-md border border-gray-300 px-3 py-1 text-sm"
            />
            <input
              type="text"
              value={newOptionValue}
              onChange={(e) => setNewOptionValue(e.target.value)}
              placeholder="Value"
              className="w-full rounded-md border border-gray-300 px-3 py-1 text-sm"
            />
          </div>
          <button
            onClick={handleAddOption}
            disabled={!newOptionLabel.trim() || !newOptionValue.trim()}
            className="w-full rounded-md px-3 py-1 text-sm font-medium text-white hover:border-white-500 hover:bg-gray-700 disabled:opacity-50"
          >
            Add Option
          </button>
        </div>
      </div>
    );
  };

  // Render table columns editor
  const renderColumnsEditor = () => {
    const currentColumns = selectedElement.properties.columns || [];
    let parsedColumns = [];

    try {
      parsedColumns =
        typeof currentColumns === "string"
          ? JSON.parse(currentColumns)
          : Array.isArray(currentColumns)
          ? currentColumns
          : [];
    } catch (e) {
      parsedColumns = [];
    }

    return (
      <div className="mt-4 space-y-4 border-t bg-transparent pt-4">
        <h4 className="text-sm font-medium text-gray-700">Table Columns</h4>

        <div className="space-y-2">
          {parsedColumns.map((column: TableColumn, index: number) => (
            <div key={index} className="flex items-center justify-between rounded-md bg-gray-50 p-2">
              <div>
                <span className="text-xs font-medium text-gray-700">{column.title}</span>
                <span className="ml-2 text-xs text-gray-500">({column.width}px)</span>
              </div>
              <button onClick={() => handleRemoveColumn(index)} className="rounded p-1 text-red-600 hover:bg-red-100">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={newColumnTitle}
              onChange={(e) => setNewColumnTitle(e.target.value)}
              placeholder="Column Title"
              className="w-full rounded-md border border-gray-300 px-3 py-1 text-sm"
            />
            <input
              type="number"
              value={newColumnWidth}
              onChange={(e) => setNewColumnWidth(Number(e.target.value))}
              placeholder="Width (px)"
              className="w-full rounded-md border border-gray-300 px-3 py-1 text-sm"
            />
          </div>
          <button
            onClick={handleAddColumn}
            disabled={!newColumnTitle.trim()}
            className="w-full rounded-md px-3 py-1 text-sm font-medium text-white hover:border-white-500 hover:bg-gray-700 disabled:opacity-50"
          >
            Add Column
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="w-72 flex-shrink-0 overflow-y-auto border-l border-gray-200 bg-transparent">
      <div className="border-b border-gray-200">
        <div className="flex">
          <button
            className={`flex-1 border-b-2 px-4 py-2 text-sm font-medium ${
              activeTab === "properties"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("properties")}
          >
            Properties
          </button>
          <button
            className={`flex-1 border-b-2 px-4 py-2 text-sm font-medium ${
              activeTab === "position"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("position")}
          >
            Position
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-medium">
            {selectedElement.type.charAt(0).toUpperCase() + selectedElement.type.slice(1)}
          </h3>
          <button
            onClick={() => onRemoveElement(selectedElement.id)}
            className="rounded bg-red-100 px-2 py-1 text-xs text-red-600 hover:bg-red-200"
          >
            Remove
          </button>
        </div>

        {activeTab === "properties" && (
          <div className="space-y-4">
            {propertiesConfig.map((config) => (
              <div key={config.name} className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">{config.label}</label>

                {config.type === "text" && (
                  <input
                    type="text"
                    value={selectedElement.properties[config.name] || ""}
                    onChange={(e) => handlePropertyChange(config.name, e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  />
                )}

                {config.type === "number" && (
                  <input
                    type="number"
                    value={selectedElement.properties[config.name] || 0}
                    onChange={(e) => handlePropertyChange(config.name, Number(e.target.value))}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  />
                )}

                {config.type === "boolean" && (
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id={`prop-${config.name}`}
                      checked={!!selectedElement.properties[config.name]}
                      onChange={(e) => handlePropertyChange(config.name, e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600"
                    />
                    <label htmlFor={`prop-${config.name}`} className="ml-2 text-sm text-gray-700">
                      {config.label}
                    </label>
                  </div>
                )}

                {config.type === "select" && (
                  <select
                    value={selectedElement.properties[config.name] || ""}
                    onChange={(e) => handlePropertyChange(config.name, e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  >
                    {config.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}

                {config.type === "color" && (
                  <div className="flex items-center">
                    <input
                      type="color"
                      value={selectedElement.properties[config.name] || "#000000"}
                      onChange={(e) => handlePropertyChange(config.name, e.target.value)}
                      className="h-8 w-8 rounded border border-gray-300"
                    />
                    <input
                      type="text"
                      value={selectedElement.properties[config.name] || "#000000"}
                      onChange={(e) => handlePropertyChange(config.name, e.target.value)}
                      className="ml-2 flex-1 rounded-md border border-gray-300 px-3 py-1 text-sm"
                    />
                  </div>
                )}

                {config.type === "screen" && (
                  <select
                    value={selectedElement.properties[config.name] || ""}
                    onChange={(e) => handlePropertyChange(config.name, e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  >
                    <option value="">None</option>
                    {screens.map((screen) => (
                      <option key={screen.id} value={screen.id}>
                        {screen.name}
                      </option>
                    ))}
                  </select>
                )}

                {config.type === "options" && <div className="text-xs text-gray-500">Configure options below</div>}

                {config.type === "columns" && <div className="text-xs text-gray-500">Configure columns below</div>}
              </div>
            ))}

            {/* Render options editor for dropdown */}
            {selectedElement.type === "dropdown" && renderOptionsEditor()}

            {/* Render columns editor for dynamic table */}
            {selectedElement.type === "dynamicTable" && renderColumnsEditor()}
          </div>
        )}

        {activeTab === "position" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">X Position</label>
                <input
                  type="number"
                  value={selectedElement.x}
                  onChange={(e) => handlePositionChange("x", Number(e.target.value))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Y Position</label>
                <input
                  type="number"
                  value={selectedElement.y}
                  onChange={(e) => handlePositionChange("y", Number(e.target.value))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Width</label>
                <input
                  type="number"
                  value={selectedElement.width}
                  onChange={(e) => handlePositionChange("width", Number(e.target.value))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Height</label>
                <input
                  type="number"
                  value={selectedElement.height}
                  onChange={(e) => handlePositionChange("height", Number(e.target.value))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
