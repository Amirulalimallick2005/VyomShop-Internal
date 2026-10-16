"use client";

import React from "react";
import { Edit } from "@/components/admin/edit";
import { SimpleForm } from "@/components/admin/simple-form";
import { TextInput } from "@/components/admin/text-input";
import { NumberInput } from "@/components/admin/number-input";
import { BooleanInput } from "@/components/admin/boolean-input";
import { ImageUploadInput } from "@/components/admin/image-upload-input";
import { required } from "ra-core";
import { Card, CardContent } from "@/components/ui/card";

export const CategoryEdit = () => {
  return (
    <Edit redirect="list">
      <Card className="max-w-2xl">
        <CardContent className="pt-6">
          <SimpleForm className="max-w-none">
            <TextInput
              source="name"
              label="Category Name"
              validate={[required()]}
            />
            <TextInput
              source="slug"
              label="URL Slug"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <NumberInput
                source="sortOrder"
                label="Sort Order"
                helperText="Lower numbers appear first in the seller listing dropdown"
              />
            </div>
            <ImageUploadInput
              source="icon"
              label="Category Icon / Image (optional)"
              helperText="Upload a category icon or image"
              folder="categories"
            />
            <TextInput
              source="description"
              label="Description (optional)"
              multiline
              rows={3}
            />
            <BooleanInput
              source="isActive"
              label="Active (visible to sellers for product listing)"
            />
          </SimpleForm>
        </CardContent>
      </Card>
    </Edit>
  );
};
