"use client";

import type { DesignElement, TableColumn } from "./types";

export function renderComponentPreview(element: DesignElement, isDarkMode: boolean) {
  const { type, properties } = element;

  switch (type) {
    case "button":
      return renderButton(properties, isDarkMode);
    case "textField":
      return renderTextField(properties, isDarkMode);
    case "card":
      return renderCard(properties, isDarkMode);
    case "switch":
      return renderSwitch(properties);
    case "checkbox":
      return renderCheckbox(properties);
    case "radio":
      return renderRadio(properties);
    case "chatInput":
      return renderChatInput(properties, isDarkMode);
    case "chatMessage":
      return renderChatMessage(properties, isDarkMode);
    case "dropdown":
      return renderDropdown(properties, isDarkMode);
    case "inputWithLabel":
      return renderInputWithLabel(properties, isDarkMode);
    case "switchWithLabel":
      return renderSwitchWithLabel(properties, isDarkMode);
    case "radioWithLabel":
      return renderRadioWithLabel(properties, isDarkMode);
    case "checkboxWithLabel":
      return renderCheckboxWithLabel(properties, isDarkMode);
    case "dynamicTable":
      return renderDynamicTable(properties, isDarkMode);
    case "label":
      return renderLabel(properties, isDarkMode);
    default:
      return <div className="h-full w-full bg-gray-200" />;
  }
}

function renderButton(properties: Record<string, any>, isDarkMode: boolean) {
  const { text, variant, rounded, color, padding, navigateTo } = properties;

  // Calcular color de texto automáticamente
  const textColor = getContrastingTextColor(color);

  let className = "flex items-center justify-center h-full w-full font-medium";

  if (variant === "primary") {
    className += ` text-white`;
  } else if (variant === "outline") {
    className += ` border-2 bg-transparent`;
    className += ` border-[${color}] text-[${color}]`;
  } else {
    className += ` bg-gray-200 text-gray-800`;
  }

  if (rounded) {
    className += " rounded-full";
  } else {
    className += " rounded-md";
  }

  const hasNavigation = navigateTo && navigateTo !== "";

  return (
    <div
      className={className}
      style={{
        padding: `${padding}px`,
        backgroundColor: variant === "primary" ? color : variant === "outline" ? "transparent" : undefined,
        color: variant === "primary" ? textColor : variant === "outline" ? color : undefined,
        borderColor: variant === "outline" ? color : undefined,
      }}
    >
      <div className="flex items-center">
        {text}
        {hasNavigation && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="ml-1 h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        )}
      </div>
    </div>
  );
}

function renderTextField(properties: Record<string, any>, isDarkMode: boolean) {
  const { hint, label, hasIcon, icon, validation } = properties;

  return (
    <div className="flex h-full w-full flex-col">
      {label && (
        <label className={`mb-1 text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>{label}</label>
      )}
      <div
        className={`flex flex-1 items-center rounded-md border ${
          validation ? "border-red-500" : isDarkMode ? "border-gray-700 bg-gray-800" : "border-gray-300"
        }`}
      >
        {hasIcon && (
          <div className="pl-3 text-gray-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
        )}
        <div className={`flex-1 px-3 py-2 text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>{hint}</div>
      </div>
      {validation && <p className="mt-1 text-xs text-red-500">Please enter a valid value</p>}
    </div>
  );
}

function renderCard(properties: Record<string, any>, isDarkMode: boolean) {
  const { title, subtitle, content, showImage, imageHeight, elevation, borderRadius, color, padding } = properties;

  return (
    <div
      className="h-full w-full overflow-hidden"
      style={{
        backgroundColor: color,
        borderRadius: `${borderRadius}px`,
        padding: `${padding}px`,
        boxShadow: `0 ${elevation}px ${elevation * 2}px rgba(0, 0, 0, 0.1)`,
      }}
    >
      {showImage && (
        <div
          className={`w-full rounded mb-3 flex items-center justify-center ${
            isDarkMode ? "bg-gray-700" : "bg-gray-200"
          }`}
          style={{ height: `${imageHeight}px` }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      )}

      <div className="space-y-2">
        <h3 className={`text-lg font-bold ${isDarkMode ? "text-gray-100" : "text-gray-900"}`}>
          {title || "Card Title"}
        </h3>

        {subtitle && <p className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>{subtitle}</p>}

        <p className={`text-sm ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
          {content || "Card content goes here..."}
        </p>
      </div>
    </div>
  );
}

function renderSwitch(properties: Record<string, any>) {
  const { value, activeColor, inactiveColor } = properties;

  return (
    <div className="flex h-full w-full items-center justify-center">
      <div
        className="relative h-6 w-12 rounded-full transition-colors duration-200"
        style={{ backgroundColor: value ? activeColor : inactiveColor }}
        onClick={(e) => e.preventDefault()}
      >
        <div
          className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-200"
          style={{ left: value ? "calc(100% - 20px - 2px)" : "2px" }}
        />
      </div>
    </div>
  );
}

function renderCheckbox(properties: Record<string, any>) {
  const { value, activeColor } = properties;

  return (
    <div className="flex h-full w-full items-center justify-center">
      <div
        className={`flex h-5 w-5 items-center justify-center rounded border ${
          value ? `bg-[${activeColor}] border-[${activeColor}]` : "border-gray-400 bg-white"
        }`}
        onClick={(e) => e.preventDefault()}
      >
        {value && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        )}
      </div>
    </div>
  );
}

function renderRadio(properties: Record<string, any>) {
  const { value, activeColor } = properties;

  return (
    <div className="flex h-full w-full items-center justify-center">
      <div
        className={`flex h-5 w-5 items-center justify-center rounded-full border ${
          value ? `border-[${activeColor}]` : "border-gray-400"
        }`}
        onClick={(e) => e.preventDefault()}
      >
        {value && <div className="h-3 w-3 rounded-full" style={{ backgroundColor: activeColor }} />}
      </div>
    </div>
  );
}

function renderChatInput(properties: Record<string, any>, isDarkMode: boolean) {
  const { placeholder, buttonText, buttonColor } = properties;

  return (
    <div className="flex h-full w-full items-center space-x-2 rounded-lg border p-2">
      <div
        className={`flex-1 rounded-md px-3 py-2 ${
          isDarkMode ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-700"
        }`}
      >
        {placeholder || "Type a message..."}
      </div>
      <button className="rounded-md px-3 py-2 text-white" style={{ backgroundColor: buttonColor || "#2196F3" }}>
        {buttonText || "Send"}
      </button>
    </div>
  );
}

function renderChatMessage(properties: Record<string, any>, isDarkMode: boolean) {
  const { text, isUser, avatar, timestamp } = properties;

  const messageText = text || "This is a sample message";
  const messageTime = "12:34 PM";

  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
      <div className="flex max-w-[80%]">
        {!isUser && avatar && <div className="mr-2 h-8 w-8 flex-shrink-0 rounded-full bg-gray-300"></div>}
        <div>
          <div
            className={`rounded-lg p-3 ${
              isUser
                ? "rounded-tr-none bg-blue-500 text-white"
                : isDarkMode
                ? "rounded-tl-none bg-gray-700 text-white"
                : "rounded-tl-none bg-gray-200 text-gray-800"
            }`}
          >
            {messageText}
          </div>
          {timestamp && <div className="mt-1 text-xs text-gray-500">{messageTime}</div>}
        </div>
        {isUser && avatar && <div className="ml-2 h-8 w-8 flex-shrink-0 rounded-full bg-blue-300"></div>}
      </div>
    </div>
  );
}

function renderDropdown(properties: Record<string, any>, isDarkMode: boolean) {
  const {
    label,
    placeholder,
    options = [],
    value,
    required,
    disabled,
    borderColor = "#d1d5db",
    backgroundColor = isDarkMode ? "#1f2937" : "#ffffff",
  } = properties;

  const parsedOptions =
    typeof options === "string"
      ? JSON.parse(options)
      : Array.isArray(options)
      ? options
      : [
          { label: "Option 1", value: "option1" },
          { label: "Option 2", value: "option2" },
          { label: "Option 3", value: "option3" },
        ];

  return (
    <div className="flex h-full w-full flex-col">
      {label && (
        <label className={`mb-1 text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}
      <div
        className={`relative flex w-full items-center rounded-md border ${disabled ? "opacity-60" : ""}`}
        style={{
          borderColor: borderColor,
          backgroundColor: backgroundColor,
        }}
      >
        <select
          className={`w-full appearance-none rounded-md border-none bg-transparent px-3 py-2 pr-8 text-sm ${
            isDarkMode ? "text-gray-300" : "text-gray-700"
          }`}
          disabled={disabled}
          defaultValue={value || ""}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {parsedOptions.map((option: any, index: number) => (
            <option key={index} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke={isDarkMode ? "#9ca3af" : "#6b7280"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </div>
    </div>
  );
}

function renderInputWithLabel(properties: Record<string, any>, isDarkMode: boolean) {
  const {
    label,
    placeholder,
    value,
    type = "text",
    required,
    disabled,
    borderColor = "#d1d5db",
    labelColor = isDarkMode ? "#d1d5db" : "#374151",
  } = properties;

  return (
    <div className="flex h-full w-full flex-col">
      <label className="mb-1 text-sm font-medium" style={{ color: labelColor }}>
        {label || "Label"}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      <input
        type={type}
        placeholder={placeholder || "Enter text..."}
        defaultValue={value || ""}
        disabled={disabled}
        className={`w-full rounded-md border px-3 py-2 text-sm ${
          isDarkMode ? "bg-gray-800 text-gray-300" : "bg-white text-gray-700"
        } ${disabled ? "opacity-60" : ""}`}
        style={{ borderColor: borderColor }}
        readOnly
      />
    </div>
  );
}

function renderSwitchWithLabel(properties: Record<string, any>, isDarkMode: boolean) {
  const {
    label,
    value,
    activeColor = "#2196F3",
    inactiveColor = "#9E9E9E",
    labelPosition = "right",
    disabled,
    labelColor = isDarkMode ? "#d1d5db" : "#374151",
  } = properties;

  const switchElement = (
    <div
      className={`relative h-6 w-12 rounded-full transition-colors duration-200 ${disabled ? "opacity-60" : ""}`}
      style={{ backgroundColor: value ? activeColor : inactiveColor }}
      onClick={(e) => e.preventDefault()}
    >
      <div
        className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-200"
        style={{ left: value ? "calc(100% - 20px - 2px)" : "2px" }}
      />
    </div>
  );

  return (
    <div className="flex h-full w-full items-center">
      {labelPosition === "left" && (
        <label className="mr-3 text-sm font-medium" style={{ color: labelColor }}>
          {label || "Label"}
        </label>
      )}

      {switchElement}

      {labelPosition === "right" && (
        <label className="ml-3 text-sm font-medium" style={{ color: labelColor }}>
          {label || "Label"}
        </label>
      )}
    </div>
  );
}

function renderRadioWithLabel(properties: Record<string, any>, isDarkMode: boolean) {
  const {
    label,
    value,
    activeColor = "#2196F3",
    labelPosition = "right",
    disabled,
    labelColor = isDarkMode ? "#d1d5db" : "#374151",
  } = properties;

  const radioElement = (
    <div
      className={`flex h-5 w-5 items-center justify-center rounded-full border ${
        value ? `border-[${activeColor}]` : "border-gray-400"
      } ${disabled ? "opacity-60" : ""}`}
      onClick={(e) => e.preventDefault()}
    >
      {value && <div className="h-3 w-3 rounded-full" style={{ backgroundColor: activeColor }} />}
    </div>
  );

  return (
    <div className="flex h-full w-full items-center">
      {labelPosition === "left" && (
        <label className="mr-3 text-sm font-medium" style={{ color: labelColor }}>
          {label || "Radio option"}
        </label>
      )}

      {radioElement}

      {labelPosition === "right" && (
        <label className="ml-3 text-sm font-medium" style={{ color: labelColor }}>
          {label || "Radio option"}
        </label>
      )}
    </div>
  );
}

function renderCheckboxWithLabel(properties: Record<string, any>, isDarkMode: boolean) {
  const {
    label,
    value,
    activeColor = "#2196F3",
    labelPosition = "right",
    disabled,
    labelColor = isDarkMode ? "#d1d5db" : "#374151",
  } = properties;

  const checkboxElement = (
    <div
      className={`flex h-5 w-5 items-center justify-center rounded border ${
        value ? `bg-[${activeColor}] border-[${activeColor}]` : "border-gray-400 bg-white"
      } ${disabled ? "opacity-60" : ""}`}
      onClick={(e) => e.preventDefault()}
    >
      {value && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      )}
    </div>
  );

  return (
    <div className="flex h-full w-full items-center">
      {labelPosition === "left" && (
        <label className="mr-3 text-sm font-medium" style={{ color: labelColor }}>
          {label || "Checkbox option"}
        </label>
      )}

      {checkboxElement}

      {labelPosition === "right" && (
        <label className="ml-3 text-sm font-medium" style={{ color: labelColor }}>
          {label || "Checkbox option"}
        </label>
      )}
    </div>
  );
}

function renderLabel(properties: Record<string, any>, isDarkMode: boolean) {
  const { text = "", fontSize = 14, fontWeight = "normal", color = "#000000", textAlign = "left" } = properties;

  return (
    <div
      style={{
        color: isDarkMode ? "#ffffff" : color,
        fontSize: `${fontSize}px`,
        fontWeight,
        textAlign,
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        userSelect: "none",
      }}
    >
      {text}
    </div>
  );
}

// Actualizar renderDynamicTable para mostrar datos reales:
function renderDynamicTable(properties: Record<string, any>, isDarkMode: boolean) {
  const {
    title,
    columns = [],
    data = [],
    showHeader = true,
    showBorder = true,
    striped = true,
    headerColor = isDarkMode ? "#1f2937" : "#f3f4f6",
    borderColor = "#e5e7eb",
    evenRowColor = isDarkMode ? "#1f2937" : "#ffffff",
    oddRowColor = isDarkMode ? "#111827" : "#f9fafb",
  } = properties;

  let parsedColumns: TableColumn[] = [];
  let parsedData: any[] = [];

  try {
    parsedColumns = typeof columns === "string" ? JSON.parse(columns) : columns;
    parsedData = typeof data === "string" ? JSON.parse(data) : data;
  } catch (e) {
    parsedColumns = [
      { id: "name", title: "Name", width: 120 },
      { id: "email", title: "Email", width: 180 },
    ];
    parsedData = [
      { name: "John Doe", email: "john@example.com" },
      { name: "Jane Smith", email: "jane@example.com" },
    ];
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      {title && (
        <div
          className={`px-3 py-2 font-medium border-b ${
            isDarkMode ? "text-gray-300 border-gray-700" : "text-gray-700 border-gray-200"
          }`}
        >
          {title}
        </div>
      )}

      <div className="flex-1 overflow-auto">
        <table
          className={`w-full ${showBorder ? "border-collapse" : "border-separate border-spacing-0"}`}
          style={{ borderColor: borderColor }}
        >
          {showHeader && (
            <thead>
              <tr style={{ backgroundColor: headerColor }}>
                {parsedColumns.map((column, index) => (
                  <th
                    key={index}
                    className={`px-3 py-2 text-left text-sm font-medium ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    } ${showBorder ? "border" : ""}`}
                    style={{
                      width: `${column.width}px`,
                      borderColor: borderColor,
                    }}
                  >
                    {column.title}
                  </th>
                ))}
              </tr>
            </thead>
          )}

          <tbody>
            {parsedData.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                style={{
                  backgroundColor: striped
                    ? rowIndex % 2 === 0
                      ? evenRowColor
                      : oddRowColor
                    : isDarkMode
                    ? "#1f2937"
                    : "#ffffff",
                }}
              >
                {parsedColumns.map((column, cellIndex) => (
                  <td
                    key={cellIndex}
                    className={`px-3 py-2 text-sm ${isDarkMode ? "text-gray-300" : "text-gray-700"} ${
                      showBorder ? "border" : ""
                    }`}
                    style={{ borderColor: borderColor }}
                  >
                    {row[column.id] || "-"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function getContrastingTextColor(hexColor: string): string {
  if (!hexColor || !hexColor.startsWith("#")) {
    return "#FFFFFF";
  }

  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);

  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "#000000" : "#FFFFFF";
}
