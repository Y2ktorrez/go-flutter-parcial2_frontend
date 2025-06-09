"use client";

import type React from "react";

import { useDrag } from "react-dnd";
import type { ComponentType } from "@/lib/types";
import { useCallback } from "react";

interface ComponentsSidebarProps {
  onAddElement: (type: ComponentType, x: number, y: number) => void;
}

interface DraggableComponentProps {
  type: ComponentType;
  label: string;
  icon: React.ReactNode;
}

export default function ComponentsSidebar({ onAddElement }: ComponentsSidebarProps) {
  const componentGroups = [
    {
      title: "Basic",      components: [
        { type: "button", label: "Button", icon: <ButtonIcon /> },
        { type: "textField", label: "Text Field", icon: <TextFieldIcon /> },
        { type: "icon", label: "Icon", icon: <IconComponentIcon /> },
        { type: "label", label: "Label", icon: <LabelIcon /> },
      ],
    },
    {
      title: "Form Elements",
      components: [
        { type: "dropdown", label: "Dropdown", icon: <DropdownIcon /> },
        { type: "inputWithLabel", label: "Input + Label", icon: <InputWithLabelIcon /> },
        { type: "switchWithLabel", label: "Switch + Label", icon: <SwitchWithLabelIcon /> },
        { type: "radioWithLabel", label: "Radio + Label", icon: <RadioWithLabelIcon /> },
        { type: "checkboxWithLabel", label: "Checkbox + Label", icon: <CheckboxWithLabelIcon /> },
      ],
    },
    {
      title: "Components",
      components: [
        { type: "card", label: "Card", icon: <CardIcon /> },
        { type: "dynamicTable", label: "Table", icon: <TableIcon /> },
        { type: "switch", label: "Switch", icon: <SwitchIcon /> },
        { type: "checkbox", label: "Checkbox", icon: <CheckboxIcon /> },
        { type: "radio", label: "Radio", icon: <RadioIcon /> },
      ],
    },
    {
      title: "Chat",
      components: [
        { type: "chatInput", label: "Chat Input", icon: <ChatInputIcon /> },
        { type: "chatMessage", label: "Chat Message", icon: <ChatMessageIcon /> },
      ],
    },
  ];

  return (
    <div className="w-64 flex-shrink-0 overflow-y-auto border-r border-gray-200 bg-transparent">
      <div className="p-4">
        <h2 className="mb-4 text-lg font-semibold">Components</h2>

        {componentGroups.map((group) => (
          <div key={group.title} className="mb-6">
            <h3 className="mb-2 text-sm font-medium text-gray-500">{group.title}</h3>
            <div className="grid grid-cols-2 gap-2">
              {group.components.map((component) => (
                <DraggableComponent
                  key={component.type}
                  type={component.type as ComponentType}
                  label={component.label}
                  icon={component.icon}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DraggableComponent({ type, label, icon }: DraggableComponentProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "component",
    item: { type },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const combinedRef = useCallback(
    (node: HTMLDivElement | null) => {
      drag(node);
    },
    [drag]
  );

  return (
    <div
      ref={combinedRef}
      className={`flex cursor-grab flex-col items-center rounded border border-gray-200 p-2 text-center transition hover:border-white-500 hover:bg-gray-700 ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <div className="mb-1 text-gray-600">{icon}</div>
      <span className="text-xs">{label}</span>
    </div>
  );
}

// Component Icons
function ButtonIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="8" width="18" height="8" rx="2" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function TextFieldIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
      <line x1="7" y1="12" x2="17" y2="12" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function CardIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
      <line x1="3" y1="9" x2="21" y2="9" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function IconComponentIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SwitchIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="9" width="18" height="6" rx="3" stroke="currentColor" strokeWidth="2" />
      <circle cx="16" cy="12" r="2" fill="currentColor" />
    </svg>
  );
}

function CheckboxIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="5" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function RadioIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="4" fill="currentColor" />
    </svg>
  );
}

function ChatInputIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="6" width="20" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M18 12L22 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ChatMessageIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DropdownIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M7 10L12 14L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function InputWithLabelIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="9" width="18" height="9" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M4 6h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function SwitchWithLabelIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="9" width="12" height="6" rx="3" stroke="currentColor" strokeWidth="2" />
      <circle cx="17" cy="12" r="2" fill="currentColor" />
      <path d="M4 12h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function RadioWithLabelIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="12" r="5" stroke="currentColor" strokeWidth="2" />
      <circle cx="16" cy="12" r="2" fill="currentColor" />
      <path d="M4 12h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CheckboxWithLabelIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="12" y="7" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M15 12L17 14L21 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 12h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function TableIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
      <line x1="3" y1="8" x2="21" y2="8" stroke="currentColor" strokeWidth="2" />
      <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="2" />
      <line x1="3" y1="16" x2="21" y2="16" stroke="currentColor" strokeWidth="2" />
      <line x1="9" y1="4" x2="9" y2="20" stroke="currentColor" strokeWidth="2" />
      <line x1="15" y1="4" x2="15" y2="20" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function LabelIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 7h16M4 12h16M4 17h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}
