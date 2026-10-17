"use client";

import React from "react";
import { useFormContext, Controller } from "react-hook-form";
import { CategoryTemplateField } from "@/lib/categoryTemplates";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sliders, Sparkles, Check } from "lucide-react";

interface CategoryDynamicFieldsProps {
  categoryName?: string;
  templateFields?: CategoryTemplateField[];
  baseSource?: string; // defaults to "attributes"
}

export const CategoryDynamicFields: React.FC<CategoryDynamicFieldsProps> = ({
  categoryName,
  templateFields = [],
  baseSource = "attributes",
}) => {
  const { control } = useFormContext();

  if (!categoryName) {
    return (
      <Card className="border-dashed bg-muted/10">
        <CardContent className="py-6 text-center text-xs text-muted-foreground flex flex-col items-center gap-1.5">
          <Sparkles className="size-4 text-orange-500/70" />
          <span>Select a <strong>Category</strong> above to see its specific specifications (e.g. sizes, material, type).</span>
        </CardContent>
      </Card>
    );
  }

  if (templateFields.length === 0) {
    return (
      <Card className="border-dashed bg-muted/10">
        <CardContent className="py-6 text-center text-xs text-muted-foreground">
          No additional specifications required for <strong>{categoryName}</strong>. You can proceed with the core product details.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-orange-500/20 bg-orange-500/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
            <Sliders className="size-4 text-orange-500" />
            {categoryName} Specifications
          </CardTitle>
          <Badge variant="outline" className="text-[11px] font-normal border-orange-300 dark:border-orange-800 text-orange-700 dark:text-orange-300 bg-orange-500/10">
            {templateFields.length} {templateFields.length === 1 ? "field" : "fields"}
          </Badge>
        </div>
        <CardDescription className="text-xs text-muted-foreground">
          Choose the options below so customers can find and filter your {categoryName.toLowerCase()} easily.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 pt-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {templateFields.map((field) => {
            const fieldPath = `${baseSource}.${field.name}`;

            if (field.type === "multiselect") {
              return (
                <div key={field.id || field.name} className="space-y-2 sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium">
                      {field.label} {field.required && <span className="text-rose-500">*</span>}
                    </Label>
                    {field.helperText && (
                      <span className="text-[11px] text-muted-foreground">{field.helperText}</span>
                    )}
                  </div>

                  <Controller
                    name={fieldPath}
                    control={control}
                    defaultValue={[]}
                    render={({ field: controllerField }) => {
                      const selectedValues: string[] = Array.isArray(controllerField.value)
                        ? controllerField.value
                        : controllerField.value
                        ? String(controllerField.value).split(",").map((s) => s.trim())
                        : [];

                      const toggleOption = (opt: string) => {
                        const exists = selectedValues.includes(opt);
                        const next = exists
                          ? selectedValues.filter((v) => v !== opt)
                          : [...selectedValues, opt];
                        controllerField.onChange(next);
                      };

                      return (
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-1.5">
                            {(field.options || []).map((opt) => {
                              const isSelected = selectedValues.includes(opt);
                              return (
                                <button
                                  type="button"
                                  key={opt}
                                  onClick={() => toggleOption(opt)}
                                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                                    isSelected
                                      ? "bg-orange-500 text-white border-orange-600 shadow-xs"
                                      : "bg-background hover:bg-muted text-foreground border-border"
                                  }`}
                                >
                                  {isSelected && <Check className="size-3" />}
                                  {opt}
                                </button>
                              );
                            })}
                          </div>
                          {selectedValues.length > 0 && (
                            <p className="text-[11px] text-muted-foreground">
                              Selected: <span className="font-semibold text-foreground">{selectedValues.join(", ")}</span>
                            </p>
                          )}
                        </div>
                      );
                    }}
                  />
                </div>
              );
            }

            if (field.type === "select") {
              return (
                <div key={field.id || field.name} className="space-y-1.5">
                  <Label className="text-xs font-medium">
                    {field.label} {field.required && <span className="text-rose-500">*</span>}
                  </Label>
                  <Controller
                    name={fieldPath}
                    control={control}
                    defaultValue=""
                    render={({ field: controllerField }) => (
                      <Select
                        value={controllerField.value || ""}
                        onValueChange={(val) => controllerField.onChange(val)}
                      >
                        <SelectTrigger className="h-9 text-xs w-full bg-background">
                          <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {(field.options || []).map((opt) => (
                            <SelectItem key={opt} value={opt} className="text-xs">
                              {opt}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {field.helperText && (
                    <span className="text-[11px] text-muted-foreground block">{field.helperText}</span>
                  )}
                </div>
              );
            }

            if (field.type === "number") {
              return (
                <div key={field.id || field.name} className="space-y-1.5">
                  <Label className="text-xs font-medium">
                    {field.label} {field.required && <span className="text-rose-500">*</span>}
                  </Label>
                  <Controller
                    name={fieldPath}
                    control={control}
                    defaultValue=""
                    render={({ field: controllerField }) => (
                      <Input
                        type="number"
                        value={controllerField.value ?? ""}
                        onChange={(e) => controllerField.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                        placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                        className="h-9 text-xs bg-background"
                      />
                    )}
                  />
                </div>
              );
            }

            // Default: text
            return (
              <div key={field.id || field.name} className="space-y-1.5">
                <Label className="text-xs font-medium">
                  {field.label} {field.required && <span className="text-rose-500">*</span>}
                </Label>
                <Controller
                  name={fieldPath}
                  control={control}
                  defaultValue=""
                  render={({ field: controllerField }) => (
                    <Input
                      type="text"
                      value={controllerField.value ?? ""}
                      onChange={(e) => controllerField.onChange(e.target.value)}
                      placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                      className="h-9 text-xs bg-background"
                    />
                  )}
                />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
