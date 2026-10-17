"use client";

import React, { useState, useEffect } from "react";
import { useInput } from "ra-core";
import {
  CategoryTemplateField,
  CATEGORY_PRESETS,
  TemplateFieldType,
} from "@/lib/categoryTemplates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Sparkles, Sliders, Check, HelpCircle } from "lucide-react";

interface CategoryTemplateBuilderProps {
  source?: string;
  categoryName?: string;
}

export const CategoryTemplateBuilder: React.FC<CategoryTemplateBuilderProps> = ({
  source = "templateFields",
  categoryName,
}) => {
  const {
    field: { value, onChange },
  } = useInput({ source });

  const [fields, setFields] = useState<CategoryTemplateField[]>([]);

  useEffect(() => {
    if (Array.isArray(value)) {
      setFields(value);
    } else if (typeof value === "string") {
      try {
        setFields(JSON.parse(value));
      } catch {
        setFields([]);
      }
    }
  }, [value]);

  const updateFields = (newFields: CategoryTemplateField[]) => {
    setFields(newFields);
    onChange(newFields);
  };

  const applyPreset = (presetKey: string) => {
    const preset = CATEGORY_PRESETS[presetKey];
    if (preset) {
      updateFields(preset.fields);
    }
  };

  const handleAddField = () => {
    const newField: CategoryTemplateField = {
      id: `field_${Date.now()}`,
      name: `field_${fields.length + 1}`,
      label: `Field ${fields.length + 1}`,
      type: "select",
      required: false,
      options: ["Option 1", "Option 2"],
    };
    updateFields([...fields, newField]);
  };

  const handleRemoveField = (index: number) => {
    const next = [...fields];
    next.splice(index, 1);
    updateFields(next);
  };

  const handleFieldChange = (index: number, patch: Partial<CategoryTemplateField>) => {
    const next = [...fields];
    next[index] = { ...next[index], ...patch };
    updateFields(next);
  };

  const handleOptionsChange = (index: number, optionsStr: string) => {
    const opts = optionsStr
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    handleFieldChange(index, { options: opts });
  };

  return (
    <Card className="border-dashed mt-4 bg-muted/20">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Sliders className="size-4 text-orange-500" />
              Category Specification Template
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              Define the specific fields (mostly dropdowns) sellers fill out when listing products under this category.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddField}
              className="text-xs h-8 gap-1.5"
            >
              <Plus className="size-3.5" /> Add Custom Field
            </Button>
          </div>
        </div>

        {/* Presets Bar */}
        <div className="pt-2 border-t mt-3">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-2">
            <Sparkles className="size-3.5 text-amber-500" /> Quick Apply Standard Presets:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(CATEGORY_PRESETS).map(([key, preset]) => (
              <Button
                key={key}
                type="button"
                variant="secondary"
                size="sm"
                className="text-xs h-7 px-2.5 font-normal hover:bg-orange-500/10 hover:text-orange-600 dark:hover:text-orange-400"
                onClick={() => applyPreset(key)}
              >
                {preset.label.split("(")[0].trim()}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-1">
        {fields.length === 0 ? (
          <div className="p-6 text-center border rounded-lg bg-background/50 border-dashed text-muted-foreground text-xs">
            No specification fields defined for this category yet. Click a preset above or click &quot;Add Custom Field&quot; to configure.
          </div>
        ) : (
          <div className="space-y-3">
            {fields.map((field, idx) => (
              <div
                key={field.id || idx}
                className="p-3.5 rounded-lg border bg-background/80 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="size-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-mono font-medium text-muted-foreground">
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-xs text-foreground">
                      {field.label || "Untitled Field"}
                    </span>
                    <Badge variant="outline" className="text-[10px] uppercase font-mono py-0 h-4">
                      {field.type}
                    </Badge>
                    {field.required && (
                      <Badge variant="secondary" className="text-[10px] py-0 h-4 bg-amber-500/10 text-amber-600">
                        Required
                      </Badge>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveField(idx)}
                    className="size-7 p-0 text-muted-foreground hover:text-rose-600"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">Field Label</Label>
                    <Input
                      value={field.label}
                      onChange={(e) =>
                        handleFieldChange(idx, {
                          label: e.target.value,
                          name: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/(^_|_$)/g, ""),
                        })
                      }
                      placeholder="e.g. Shoe Type, Fabric"
                      className="h-8 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">Storage Key (JSON)</Label>
                    <Input
                      value={field.name}
                      onChange={(e) => handleFieldChange(idx, { name: e.target.value })}
                      placeholder="e.g. type, fabric, colour"
                      className="h-8 text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">Input Type</Label>
                    <Select
                      value={field.type}
                      onValueChange={(val) => {
                        if (val) handleFieldChange(idx, { type: val as TemplateFieldType });
                      }}
                    >
                      <SelectTrigger className="h-8 text-xs w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="select">Dropdown (Single Choice)</SelectItem>
                        <SelectItem value="multiselect">Multi-select (Multiple Choices)</SelectItem>
                        <SelectItem value="text">Text Input</SelectItem>
                        <SelectItem value="number">Number Input</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {(field.type === "select" || field.type === "multiselect") && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between">
                      <Label className="text-[11px] text-muted-foreground flex items-center gap-1">
                        Dropdown Options (comma separated)
                        <HelpCircle className="size-3 text-muted-foreground/70" />
                      </Label>
                      <span className="text-[10px] text-muted-foreground">
                        {(field.options || []).length} options configured
                      </span>
                    </div>
                    <Input
                      value={(field.options || []).join(", ")}
                      onChange={(e) => handleOptionsChange(idx, e.target.value)}
                      placeholder="e.g. Sneaker, Sandal, Heel, Boot, Loafer"
                      className="h-8 text-xs"
                    />
                    <div className="flex flex-wrap gap-1 pt-1 max-h-20 overflow-y-auto">
                      {(field.options || []).map((opt, optIdx) => (
                        <span
                          key={optIdx}
                          className="inline-flex items-center text-[10px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground"
                        >
                          {opt}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-1 border-t">
                  <label className="flex items-center gap-2 text-xs cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={Boolean(field.required)}
                      onChange={(e) => handleFieldChange(idx, { required: e.target.checked })}
                      className="rounded border-input text-primary focus:ring-primary size-3.5"
                    />
                    <span className="text-muted-foreground text-[11px]">
                      Required field when seller uploads product
                    </span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
